package br.com.sorospot.controllers;

import br.com.sorospot.services.GeocodeResult;
import br.com.sorospot.services.GoogleMapsService;
import br.com.sorospot.domains.Category;
import br.com.sorospot.domains.Occurrence;
import br.com.sorospot.repositories.CategoryRepository;
import br.com.sorospot.repositories.OccurrenceRepository;
import br.com.sorospot.repositories.UserRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Collectors;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

    

@RestController
@RequestMapping("/api/maps")
public class MapsController {

    private final GoogleMapsService googleMapsService;
    
    private final OccurrenceRepository occurrenceRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public MapsController(GoogleMapsService googleMapsService,
                          OccurrenceRepository occurrenceRepository, CategoryRepository categoryRepository,
                          UserRepository userRepository) {
        this.googleMapsService = googleMapsService;
        this.occurrenceRepository = occurrenceRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
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

    @PostMapping(value = "/markers", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public java.util.Map<String,Object> addMarkerMultipart(@RequestParam double lat,
                                                           @RequestParam double lng,
                                                           @RequestParam String title,
                                                           @RequestParam String description,
                                                           @RequestParam String color,
                                                           @RequestParam(required = false) MultipartFile image) throws IOException {

        Category cat = categoryRepository.findAll().stream().findFirst().orElse(null);
        if (cat == null) {
            cat = new Category();
            cat.setType("outros");
            cat.setColor("#888888");
            cat = categoryRepository.save(cat);
        }
        Occurrence o = new Occurrence();
        o.setCategory(cat);
        o.setDescription(description);
        o.setTitle(title);
        o.setLatitude(new java.math.BigDecimal(lat));
        o.setLongitude(new java.math.BigDecimal(lng));
        String addr = String.format("lat:%s,lng:%s", lat, lng);
        o.setAddress(addr);
        o.setStatus("novo");

        if (image != null && !image.isEmpty()) {
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);
            String filename = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            Path target = uploadDir.resolve(filename);
            Files.copy(image.getInputStream(), target);
            o.setPhoto(filename);
        }

        userRepository.findAll().stream().filter(u -> "demo@sorospot.local".equals(u.getEmail())).findFirst().ifPresent(o::setUser);
        Occurrence saved = occurrenceRepository.save(o);

        java.util.Map<String,Object> resp = Map.of(
                "id", saved.getId(),
                "title", saved.getTitle(),
                "description", saved.getDescription(),
                "address", saved.getAddress(),
                "latitude", saved.getLatitude(),
                "longitude", saved.getLongitude(),
                "photo", saved.getPhoto(),
                "category", saved.getCategory() != null ? saved.getCategory().getType() : null,
                "user", saved.getUser() != null ? saved.getUser().getName() : null
        );
        return resp;
    }

    @GetMapping(value = "/occurrences", produces = MediaType.APPLICATION_JSON_VALUE)
    public java.util.List<?> listOccurrences() {
    return occurrenceRepository.findAll().stream().map(o -> Map.of(
        "id", o.getId(),
        "title", o.getTitle(),
        "category", o.getCategory() != null ? o.getCategory().getType() : null,
        "description", o.getDescription(),
        "address", o.getAddress(),
        "latitude", o.getLatitude(),
        "longitude", o.getLongitude(),
        "photo", o.getPhoto(),
        "user", o.getUser() != null ? o.getUser().getName() : null,
        "createdAt", o.getCreatedAt()
    )).collect(Collectors.toList());
    }
}
