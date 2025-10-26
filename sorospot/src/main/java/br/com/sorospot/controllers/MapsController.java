package br.com.sorospot.controllers;

import br.com.sorospot.dtos.GeocodeResult;
import br.com.sorospot.services.GoogleMapsService;
import br.com.sorospot.services.OccurrenceService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maps")
public class MapsController {

    private final GoogleMapsService googleMapsService;
    private final OccurrenceService occurrenceService;

    public MapsController(GoogleMapsService googleMapsService,
                          OccurrenceService occurrenceService) {
        this.googleMapsService = googleMapsService;
        this.occurrenceService = occurrenceService;
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
    public Map<String, Object> addMarkerMultipart(@RequestParam double lat,
                                                   @RequestParam double lng,
                                                   @RequestParam String title,
                                                   @RequestParam String description,
                                                   @RequestParam String color,
                                                   @RequestParam(required = false) MultipartFile image,
                                                   @RequestHeader(value = "X-User-Email", required = false) String userEmail) 
            throws IOException {
        return occurrenceService.createOccurrence(lat, lng, title, description, color, image, userEmail);
    }

    @DeleteMapping(value = "/markers/{id}")
    public ResponseEntity<?> deleteMarker(@PathVariable Integer id,
                                          @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        try {
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
    public List<Map<String, Object>> myOccurrences(@RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        return occurrenceService.getMyOccurrences(userEmail);
    }

    @PutMapping(value = "/markers/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, 
                produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateMarker(@PathVariable Integer id,
                                          @RequestParam(required = false) String title,
                                          @RequestParam(required = false) String description,
                                          @RequestParam(required = false) String color,
                                          @RequestParam(required = false) String removePhotos,
                                          @RequestParam(required = false) MultipartFile image,
                                          @RequestHeader(value = "X-User-Email", required = false) String userEmail) 
            throws IOException {
        try {
            Map<String, Object> result = occurrenceService.updateOccurrence(
                    id, title, description, color, removePhotos, image, userEmail);
            
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
    public List<Map<String, Object>> listOccurrences() {
        return occurrenceService.listAllOccurrences();
    }
}