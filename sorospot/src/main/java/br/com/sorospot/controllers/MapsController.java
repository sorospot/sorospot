package br.com.sorospot.controllers;

import br.com.sorospot.services.GeocodeResult;
import br.com.sorospot.services.GoogleMapsService;
import br.com.sorospot.domains.Category;
import br.com.sorospot.domains.Occurrence;
import br.com.sorospot.repositories.CategoryRepository;
import br.com.sorospot.repositories.OccurrenceRepository;
import br.com.sorospot.repositories.PhotoRepository;
import br.com.sorospot.repositories.UserRepository;
import br.com.sorospot.repositories.UserRoleRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Collectors;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Mono;

    

@RestController
@RequestMapping("/api/maps")
public class MapsController {

    private final GoogleMapsService googleMapsService;
    
    private final OccurrenceRepository occurrenceRepository;
    private final PhotoRepository photoRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    public MapsController(GoogleMapsService googleMapsService,
                          OccurrenceRepository occurrenceRepository, PhotoRepository photoRepository, CategoryRepository categoryRepository,
                          UserRepository userRepository, UserRoleRepository userRoleRepository) {
        this.googleMapsService = googleMapsService;
        this.occurrenceRepository = occurrenceRepository;
        this.photoRepository = photoRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
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
                                                           @RequestParam(required = false) MultipartFile image,
                                                           @RequestHeader(value = "X-User-Email", required = false) String userEmail) throws IOException {
        // validações
        if (title == null || title.trim().isEmpty()) throw new IllegalArgumentException("Título obrigatório");
        if (description == null) description = "";
        if (color == null || !color.matches("^#([0-9a-fA-F]{6})$")) color = "#ff0000";

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
    o.setColor(color);

        // handle image: validar e armazenar com nome do arquivo UUID
        final long MAX_BYTES = 5L * 1024L * 1024L; // 5 MB
        if (image != null && !image.isEmpty()) {
            if (image.getSize() > MAX_BYTES) throw new IllegalArgumentException("Imagem muito grande, máx 5MB");
            String ct = image.getContentType();
            if (ct == null || !ct.toLowerCase().startsWith("image/")) throw new IllegalArgumentException("Imagem inválida, tipo inválido");
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);
            String ext = "";
            String orig = image.getOriginalFilename();
            if (orig != null && orig.contains(".")) ext = orig.substring(orig.lastIndexOf('.'));
            String filename = java.util.UUID.randomUUID().toString() + ext;
            Path target = uploadDir.resolve(filename);
            Files.copy(image.getInputStream(), target);
            br.com.sorospot.domains.Photo ph = new br.com.sorospot.domains.Photo();
            ph.setFilename(filename);
            ph.setOccurrence(o);
            o.getPhotos().add(ph);
            // photoRepository.save(ph); // vai ser salvar quando salvar a ocorrência
        }

        // determina user pelo header, senão tiver vai pro usuario padrao de teste
        final String headerEmail = (userEmail != null && !userEmail.isBlank()) ? userEmail : "demo@sorospot.local";
        // tenta achar um usuario, senao cria um
        br.com.sorospot.domains.User found = null;
        for (br.com.sorospot.domains.User u : userRepository.findAll()) {
            if (headerEmail.equals(u.getEmail())) { found = u; break; }
        }
        if (found == null) {
            br.com.sorospot.domains.User nu = new br.com.sorospot.domains.User();
            nu.setEmail(headerEmail);
            // seta um nome
            String name = headerEmail.contains("@") ? headerEmail.substring(0, headerEmail.indexOf('@')) : headerEmail;
            nu.setName(name);
            // Coloca alguns campos
            nu.setCpf("00000000000");
            nu.setTelephone("0000000000");
            // senha minima
            nu.setPassword("changeme");
            // tenta colocar o role do user
            br.com.sorospot.domains.UserRole userRole = null;
            for (br.com.sorospot.domains.UserRole r : userRoleRepository.findAll()) {
                if ("USER".equalsIgnoreCase(r.getUserRole())) { userRole = r; break; }
            }
            if (userRole == null) {
                br.com.sorospot.domains.UserRole r = new br.com.sorospot.domains.UserRole();
                r.setUserRole("USER");
                userRole = userRoleRepository.save(r);
            }
            nu.setRole(userRole);
            found = userRepository.save(nu);
        }
        o.setUser(found);
        Occurrence saved = occurrenceRepository.save(o);

    java.util.Map<String,Object> resp = new java.util.HashMap<>();
    resp.put("id", saved.getId());
    resp.put("title", saved.getTitle());
    resp.put("description", saved.getDescription());
    resp.put("address", saved.getAddress());
    resp.put("latitude", saved.getLatitude());
    resp.put("longitude", saved.getLongitude());
        java.util.List<String> photos = new java.util.ArrayList<>();
    if (saved.getPhotos() != null) {
        for (br.com.sorospot.domains.Photo ph : saved.getPhotos()) if (ph != null && ph.getFilename() != null && !ph.getFilename().isBlank()) photos.add(ph.getFilename());
    }
    resp.put("photos", photos);
    resp.put("photo", photos.isEmpty() ? null : photos.get(0));
    resp.put("color", saved.getColor());
    resp.put("category", saved.getCategory() != null ? saved.getCategory().getType() : null);
    resp.put("user", saved.getUser() != null ? saved.getUser().getName() : null);
    resp.put("userEmail", saved.getUser() != null ? saved.getUser().getEmail() : null);
    return resp;
    }

    @DeleteMapping(value = "/markers/{id}")
    public ResponseEntity<?> deleteMarker(@PathVariable Integer id,
                                          @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        var opt = occurrenceRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        var occ = opt.get();
        var ownerEmail = occ.getUser() != null ? occ.getUser().getEmail() : null;
        final String actor = (userEmail != null && !userEmail.isBlank()) ? userEmail : "";
        if (ownerEmail == null || !ownerEmail.equals(actor)) return ResponseEntity.status(403).build();
        occurrenceRepository.delete(occ);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/my-occurrences", produces = MediaType.APPLICATION_JSON_VALUE)
    public java.util.List<?> myOccurrences(@RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        final String header = (userEmail != null && !userEmail.isBlank()) ? userEmail : "demo@sorospot.local";
        return occurrenceRepository.findAll().stream().filter(o -> o.getUser() != null && header.equals(o.getUser().getEmail())).map(o -> {
            java.util.Map<String,Object> m = new java.util.HashMap<>();
            m.put("id", o.getId());
            m.put("title", o.getTitle());
            m.put("category", o.getCategory() != null ? o.getCategory().getType() : null);
            m.put("description", o.getDescription());
            m.put("address", o.getAddress());
            m.put("latitude", o.getLatitude());
            m.put("longitude", o.getLongitude());
            java.util.List<String> photos = new java.util.ArrayList<>();
            if (o.getPhotos() != null) for (br.com.sorospot.domains.Photo ph : o.getPhotos()) if (ph != null && ph.getFilename() != null && !ph.getFilename().isBlank()) photos.add(ph.getFilename());
            m.put("photos", photos);
            m.put("photo", photos.isEmpty() ? null : photos.get(0));
            m.put("color", o.getColor());
            m.put("user", o.getUser() != null ? o.getUser().getName() : null);
            m.put("userEmail", o.getUser() != null ? o.getUser().getEmail() : null);
            m.put("createdAt", o.getCreatedAt());
            return m;
        }).collect(Collectors.toList());
    }

    @PutMapping(value = "/markers/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateMarker(@PathVariable Integer id,
                                          @RequestParam(required = false) String title,
                                          @RequestParam(required = false) String description,
                                          @RequestParam(required = false) String color,
                                          @RequestParam(required = false) String removePhotos,
                                          @RequestParam(required = false) MultipartFile image,
                                          @RequestHeader(value = "X-User-Email", required = false) String userEmail) throws IOException {
        var opt = occurrenceRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        var occ = opt.get();
        var ownerEmail = occ.getUser() != null ? occ.getUser().getEmail() : null;
        final String actor = (userEmail != null && !userEmail.isBlank()) ? userEmail : "";
        if (ownerEmail == null || !ownerEmail.equals(actor)) return ResponseEntity.status(403).build();

        if (title != null) occ.setTitle(title);
        if (description != null) occ.setDescription(description);
        if (color != null && color.matches("^#([0-9a-fA-F]{6})$")) occ.setColor(color);

        // handle para remover foto
        if (removePhotos != null && !removePhotos.isBlank() && occ.getPhotos() != null && !occ.getPhotos().isEmpty()) {
            java.util.Set<String> removeSet = new java.util.HashSet<>();
            for (String r : removePhotos.split(",")) {
                String clean = Paths.get(r.trim()).getFileName().toString();
                if (!clean.isBlank()) removeSet.add(clean);
            }
            if (!removeSet.isEmpty()) {
                java.util.Iterator<br.com.sorospot.domains.Photo> it = occ.getPhotos().iterator();
                while (it.hasNext()) {
                    br.com.sorospot.domains.Photo ph = it.next();
                    if (ph == null || ph.getFilename() == null) continue;
                    if (removeSet.contains(ph.getFilename())) {
                        try { Files.deleteIfExists(Paths.get("uploads").resolve(ph.getFilename())); } catch (Exception ex) { /* ignore */ }
                        it.remove();
                        if (ph.getId() != null) photoRepository.delete(ph);
                    }
                }
            }
        }

        // handle append image
        if (image != null && !image.isEmpty()) {
            final long MAX_BYTES = 5L * 1024L * 1024L; // 5 MB
            if (image.getSize() > MAX_BYTES) return ResponseEntity.badRequest().body("image too large");
            String ct = image.getContentType();
            if (ct == null || !ct.toLowerCase().startsWith("image/")) return ResponseEntity.badRequest().body("invalid image type");
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);
            String ext = "";
            String orig = image.getOriginalFilename();
            if (orig != null && orig.contains(".")) ext = orig.substring(orig.lastIndexOf('.'));
            String filename = java.util.UUID.randomUUID().toString() + ext;
            Path target = uploadDir.resolve(filename);
            Files.copy(image.getInputStream(), target);
            // adicionar foto e persistir via relacionamento
            br.com.sorospot.domains.Photo ph = new br.com.sorospot.domains.Photo();
            ph.setFilename(filename);
            ph.setOccurrence(occ);
            occ.getPhotos().add(ph);
                // Nao salvar a Photo aqui: a ocorrência já existe, mas é melhor salvar todas juntas abaixo
        }
        Occurrence saved = occurrenceRepository.save(occ);
        java.util.Map<String,Object> resp = new java.util.HashMap<>();
        resp.put("id", saved.getId());
        resp.put("title", saved.getTitle());
        resp.put("description", saved.getDescription());
        resp.put("address", saved.getAddress());
        resp.put("latitude", saved.getLatitude());
        resp.put("longitude", saved.getLongitude());
    java.util.List<String> photos = new java.util.ArrayList<>();
    if (saved.getPhotos() != null) for (br.com.sorospot.domains.Photo ph : saved.getPhotos()) if (ph != null && ph.getFilename() != null && !ph.getFilename().isBlank()) photos.add(ph.getFilename());
        resp.put("photos", photos);
        resp.put("photo", photos.isEmpty() ? null : photos.get(0));
        resp.put("color", saved.getColor());
        resp.put("category", saved.getCategory() != null ? saved.getCategory().getType() : null);
        resp.put("user", saved.getUser() != null ? saved.getUser().getName() : null);
        resp.put("userEmail", saved.getUser() != null ? saved.getUser().getEmail() : null);
        return ResponseEntity.ok(resp);
    }

    @GetMapping(value = "/occurrences", produces = MediaType.APPLICATION_JSON_VALUE)
    public java.util.List<?> listOccurrences() {
        return occurrenceRepository.findAll().stream().map(o -> {
            java.util.Map<String,Object> m = new java.util.HashMap<>();
            m.put("id", o.getId());
            m.put("title", o.getTitle());
            m.put("category", o.getCategory() != null ? o.getCategory().getType() : null);
            m.put("description", o.getDescription());
            m.put("address", o.getAddress());
            m.put("latitude", o.getLatitude());
            m.put("longitude", o.getLongitude());
            java.util.List<String> photos = new java.util.ArrayList<>();
            if (o.getPhotos() != null) for (br.com.sorospot.domains.Photo ph : o.getPhotos()) if (ph != null && ph.getFilename() != null && !ph.getFilename().isBlank()) photos.add(ph.getFilename());
            m.put("photos", photos);
            m.put("photo", photos.isEmpty() ? null : photos.get(0));
            m.put("color", o.getColor());
            m.put("user", o.getUser() != null ? o.getUser().getName() : null);
            m.put("userEmail", o.getUser() != null ? o.getUser().getEmail() : null);
            m.put("createdAt", o.getCreatedAt());
            return m;
        }).collect(Collectors.toList());
    }
}
