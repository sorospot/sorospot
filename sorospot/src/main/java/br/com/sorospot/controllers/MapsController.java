package br.com.sorospot.controllers;

import br.com.sorospot.dtos.GeocodeResult;
import br.com.sorospot.repositories.CategoryRepository;
import br.com.sorospot.services.GoogleMapsService;
import br.com.sorospot.services.OccurrenceService;
import br.com.sorospot.services.UserService;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/maps")
public class MapsController {

    private final GoogleMapsService googleMapsService;
    private final OccurrenceService occurrenceService;
    private final UserService userService;
    private final CategoryRepository categoryRepository;

    public MapsController(GoogleMapsService googleMapsService,
                          OccurrenceService occurrenceService,
                          CategoryRepository categoryRepository,
                          UserService userService) {
        this.googleMapsService = googleMapsService;
        this.occurrenceService = occurrenceService;
        this.categoryRepository = categoryRepository;
        this.userService = userService;
    }

    @GetMapping(value = "/geocode", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<String> geocode(@RequestParam String address) {
        return googleMapsService.geocode(address);
    }

    @GetMapping(value = "/geocode-simple", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<GeocodeResult> geocodeSimple(@RequestParam String address) {
        return googleMapsService.geocodeSimple(address).map(opt -> opt.orElse(null));
    }

    @GetMapping(value = "/reverse", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<String> reverse(@RequestParam double lat, @RequestParam double lng) {
        return googleMapsService.reverseGeocode(lat, lng);
    }

    @PostMapping(value = "/markers", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, 
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> addMarkerMultipart(@RequestParam double lat,
                                                   @RequestParam double lng,
                                                   @RequestParam String title,
                                                   @RequestParam String description,
                                                   @RequestParam(required = false) Integer categoryId,
                                                   @RequestParam(required = false) MultipartFile image,
                                                   HttpSession session) 
            throws IOException {
        String userEmail = session != null ? (String) session.getAttribute("userEmail") : null;
        if (userEmail == null || userEmail.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(
                occurrenceService.createOccurrence(lat, lng, title, description, categoryId, image, userEmail)
        );
    }

    @DeleteMapping(value = "/markers/{id}")
    public ResponseEntity<?> deleteMarker(@PathVariable Integer id,
                                          HttpSession session) {
        try {
            String userEmail = session != null ? (String) session.getAttribute("userEmail") : null;
            if (userEmail == null || userEmail.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            boolean deleted = occurrenceService.deleteOccurrence(id, userEmail);
            if (!deleted) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @GetMapping(value = "/my-occurrences", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Map<String, Object>>> myOccurrences(HttpSession session) {
        String userEmail = session != null ? (String) session.getAttribute("userEmail") : null;
        if (userEmail == null || userEmail.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(occurrenceService.getMyOccurrences(userEmail));
    }

    @GetMapping(value = "/admin/occurrences", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Map<String, Object>>> adminOccurrences(@RequestParam(required = false) String userEmailFilter,
                                                                      HttpSession session) {
        String sessionEmail = session != null ? (String) session.getAttribute("userEmail") : null;
        if (sessionEmail == null || sessionEmail.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        var user = userService.findOrCreateUser(sessionEmail);
        if (!userService.isAdmin(user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<Map<String, Object>> all = occurrenceService.listAllOccurrences();
        if (userEmailFilter != null && !userEmailFilter.isBlank()) {
            String norm = userEmailFilter.trim().toLowerCase();
            all = all.stream()
                    .filter(m -> {
                        Object email = m.get("userEmail");
                        return email != null && email.toString().trim().toLowerCase().contains(norm);
                    })
                    .toList();
        }
        return ResponseEntity.ok(all);
    }

    @PutMapping(value = "/markers/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, 
                produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateMarker(@PathVariable Integer id,
                                          @RequestParam(required = false) String title,
                                          @RequestParam(required = false) String description,
                                          @RequestParam(required = false) Integer categoryId,
                                          @RequestParam(required = false) String removePhotos,
                                          @RequestParam(required = false) MultipartFile image,
                                          HttpSession session) 
            throws IOException {
        try {
            String userEmail = session != null ? (String) session.getAttribute("userEmail") : null;
            if (userEmail == null || userEmail.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            Map<String, Object> result = occurrenceService.updateOccurrence(
                    id, title, description, categoryId, removePhotos, image, userEmail);
            
            if (result == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping(value = "/occurrences", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Map<String, Object>>> listOccurrences(HttpSession session) {
        // Endpoint público para mapa - retorna todos pins mas sem dados sensíveis de usuário
        // Apenas admin pode ver detalhes completos via /admin/occurrences
        List<Map<String, Object>> occurrences = occurrenceService.listAllOccurrences();
        
        // Filtra informações sensíveis para usuários não-admin
        String sessionEmail = session != null ? (String) session.getAttribute("userEmail") : null;
        boolean isAdmin = false;
        if (sessionEmail != null && !sessionEmail.isBlank()) {
            var user = userService.findOrCreateUser(sessionEmail);
            isAdmin = userService.isAdmin(user);
        }
        
        if (!isAdmin) {
            // Para não-admins, mantém userEmail apenas se for o próprio usuário
            final String currentUserEmail = sessionEmail;
            occurrences = occurrences.stream()
                    .peek(occ -> {
                        Object occEmail = occ.get("userEmail");
                        // Remove email se não for o próprio usuário
                        if (occEmail == null || currentUserEmail == null || 
                            !occEmail.toString().equalsIgnoreCase(currentUserEmail)) {
                            occ.remove("userEmail");
                        }
                    })
                    .collect(Collectors.toList());
        }
        
        return ResponseEntity.ok(occurrences);
    }

    @GetMapping(value = "/categories", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Map<String, Object>>> getCategories() {
        List<Map<String, Object>> categories = categoryRepository.findAll().stream()
                .filter(c -> !c.getDeleted())
                .map(c -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", c.getId());
                    map.put("type", c.getType());
                    map.put("color", c.getColor());
                    map.put("icon", c.getIcon());
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }
}