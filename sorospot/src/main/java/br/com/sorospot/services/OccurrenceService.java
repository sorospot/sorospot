package br.com.sorospot.services;

import br.com.sorospot.domains.Category;
import br.com.sorospot.domains.Occurrence;
import br.com.sorospot.domains.Photo;
import br.com.sorospot.domains.User;
import br.com.sorospot.repositories.CategoryRepository;
import br.com.sorospot.repositories.OccurrenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OccurrenceService {

    private final OccurrenceRepository occurrenceRepository;
    private final CategoryRepository categoryRepository;
    private final PhotoService photoService;
    private final UserService userService;

    public OccurrenceService(OccurrenceRepository occurrenceRepository,
                             CategoryRepository categoryRepository,
                             PhotoService photoService,
                             UserService userService) {
        this.occurrenceRepository = occurrenceRepository;
        this.categoryRepository = categoryRepository;
        this.photoService = photoService;
        this.userService = userService;
    }

    public Map<String, Object> createOccurrence(double lat, double lng, String title, 
                                                String description, String color,
                                                MultipartFile image, String userEmail) throws IOException {
        
        if (userEmail == null || userEmail.isBlank()) {
            throw new SecurityException("Unauthorized");
        }
        
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Título obrigatório");
        }
        if (description == null) description = "";
        if (color == null || !color.matches("^#([0-9a-fA-F]{6})$")) color = "#ff0000";

        Category cat = getOrCreateDefaultCategory();
        
        Occurrence o = new Occurrence();
        o.setCategory(cat);
        o.setDescription(description);
        o.setTitle(title);
        o.setDeleted(false);
        o.setLatitude(new BigDecimal(lat));
        o.setLongitude(new BigDecimal(lng));
        String addr = String.format("lat:%s,lng:%s", lat, lng);
        o.setAddress(addr);
        o.setStatus("novo");
        o.setColor(color);

        // handle image
        if (image != null && !image.isEmpty()) {
            Photo ph = photoService.savePhoto(image, o);
            o.getPhotos().add(ph);
        }

        // determina user
        User found = userService.findOrCreateUser(userEmail);
        o.setUser(found);
        
        Occurrence saved = occurrenceRepository.save(o);
        return buildOccurrenceResponse(saved);
    }

    @Transactional
    public boolean deleteOccurrence(Integer id, String userEmail) {
        var opt = occurrenceRepository.findById(id);
        if (opt.isEmpty()) return false;
        
        var occ = opt.get();
        var ownerEmail = occ.getUser() != null ? occ.getUser().getEmail() : null;
        final String actor = (userEmail != null && !userEmail.isBlank()) ? userEmail : "";
        
        if (ownerEmail == null || !ownerEmail.equals(actor)) {
            throw new SecurityException("Unauthorized");
        }
        
        occurrenceRepository.delete(occ);
        return true;
    }

    public List<Map<String, Object>> getMyOccurrences(String userEmail) {
        final String header = (userEmail != null && !userEmail.isBlank()) ? userEmail : "demo@sorospot.local";
        
        return occurrenceRepository.findAll().stream()
                .filter(o -> o.getUser() != null && header.equals(o.getUser().getEmail()))
                .map(this::buildOccurrenceResponse)
                .collect(Collectors.toList());
    }

    public Map<String, Object> updateOccurrence(Integer id, String title, String description,
                                                String color, String removePhotos,
                                                MultipartFile image, String userEmail) throws IOException {
        var opt = occurrenceRepository.findById(id);
        if (opt.isEmpty()) return null;
        
        var occ = opt.get();
        var ownerEmail = occ.getUser() != null ? occ.getUser().getEmail() : null;
        final String actor = (userEmail != null && !userEmail.isBlank()) ? userEmail : "";
        
        if (ownerEmail == null || !ownerEmail.equals(actor)) {
            throw new SecurityException("Unauthorized");
        }

        if (title != null) occ.setTitle(title);
        if (description != null) occ.setDescription(description);
        if (color != null && color.matches("^#([0-9a-fA-F]{6})$")) occ.setColor(color);

        // handle para remover foto
        if (removePhotos != null && !removePhotos.isBlank()) {
            photoService.removePhotos(occ, removePhotos);
        }

        // handle append image
        if (image != null && !image.isEmpty()) {
            Photo ph = photoService.savePhoto(image, occ);
            occ.getPhotos().add(ph);
        }
        
        Occurrence saved = occurrenceRepository.save(occ);
        return buildOccurrenceResponse(saved);
    }

    public List<Map<String, Object>> listAllOccurrences() {
        return occurrenceRepository.findAll().stream()
                .map(this::buildOccurrenceResponse)
                .collect(Collectors.toList());
    }

    private Category getOrCreateDefaultCategory() {
        Category cat = categoryRepository.findAll().stream().findFirst().orElse(null);
        if (cat == null) {
            cat = new Category();
            cat.setType("outros");
            cat.setColor("#888888");
            cat = categoryRepository.save(cat);
        }
        return cat;
    }

    private Map<String, Object> buildOccurrenceResponse(Occurrence o) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", o.getId());
        m.put("title", o.getTitle());
        m.put("category", o.getCategory() != null ? o.getCategory().getType() : null);
        m.put("description", o.getDescription());
        m.put("address", o.getAddress());
        m.put("latitude", o.getLatitude());
        m.put("longitude", o.getLongitude());
        
        List<String> photos = new ArrayList<>();
        if (o.getPhotos() != null) {
            for (Photo ph : o.getPhotos()) {
                if (ph != null && ph.getFilename() != null && !ph.getFilename().isBlank()) {
                    photos.add(ph.getFilename());
                }
            }
        }
        m.put("photos", photos);
        m.put("photo", photos.isEmpty() ? null : photos.get(0));
        m.put("color", o.getColor());
        m.put("user", o.getUser() != null ? o.getUser().getName() : null);
        m.put("userEmail", o.getUser() != null ? o.getUser().getEmail() : null);
        
        if (o.getCreatedAt() != null) {
            m.put("createdAt", o.getCreatedAt());
        }
        if (o.getDeleted() != null) {
            m.put("deleted", o.getDeleted());
        }
        
        return m;
    }
}