package br.com.sorospot.services;

import br.com.sorospot.repositories.OccurrenceRepository;
import br.com.sorospot.domains.User;
import br.com.sorospot.repositories.user.UsersRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;
import java.util.Optional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    private final OccurrenceRepository occurrenceRepository;
    private final UsersRepository usersRepository;
    private final String imagesDirPath;

    public ProfileService(OccurrenceRepository occurrenceRepository, UsersRepository usersRepository,
                          @Value("${app.images.path:src/main/resources/static/images}") String imagesDirPath) {
        this.occurrenceRepository = occurrenceRepository;
        this.usersRepository = usersRepository;
        this.imagesDirPath = imagesDirPath;
    }

    public long countOccurrencesByUserId(Integer userId) {
        if (userId == null) return 0L;
        return occurrenceRepository.countByUser_IdAndDeletedFalse(userId);
    }

    public long countOccurrencesByUserEmail(String email) {
        if (email == null || email.isBlank()) return 0L;
        return occurrenceRepository.countByUser_EmailAndDeletedFalse(email.toLowerCase());
    }

    @Transactional
    public Optional<User> updateProfileByEmail(String email, Map<String, Object> payload) {
        if (email == null || email.isBlank()) return Optional.empty();
        final String normalized = email.trim().toLowerCase();

        Optional<User> opt = usersRepository.findByEmailAndDeletedFalse(normalized);
        if (opt.isEmpty()) return Optional.empty();

        User user = opt.get();
        boolean changed = false;

        if (payload.containsKey("name")) {
            Object v = payload.get("name");
            if (v != null) {
                String name = v.toString().trim();
                if (!name.isBlank() && !name.equals(user.getName())) {
                    user.setName(name);
                    changed = true;
                }
            }
        }

        if (payload.containsKey("email")) {
            Object v = payload.get("email");
            if (v != null) {
                String e = v.toString().trim().toLowerCase();
                if (!e.isBlank() && !e.equals(user.getEmail())) {
                    // check uniqueness
                    if (usersRepository.existsByEmail(e)) {
                        throw new IllegalArgumentException("Email já está em uso");
                    }
                    user.setEmail(e);
                    changed = true;
                }
            }
        }

        if (payload.containsKey("telephone")) {
            Object v = payload.get("telephone");
            if (v != null) {
                String tel = v.toString().trim();
                if (!tel.equals(user.getTelephone())) {
                    user.setTelephone(tel);
                    changed = true;
                }
            }
        }

        if (changed) {
            usersRepository.save(user);
        }

        return Optional.of(user);
    }

    private static final long MAX_BYTES = 5L * 1024L * 1024L; // 5 MB
    // store uploaded images inside a configurable folder (default: project's static images)

    @Transactional
    public Optional<User> updateProfilePhoto(String email, MultipartFile image) throws IOException {
        if (email == null || email.isBlank()) return Optional.empty();
        final String normalized = email.trim().toLowerCase();

        Optional<User> opt = usersRepository.findByEmailAndDeletedFalse(normalized);
        if (opt.isEmpty()) return Optional.empty();

        if (image == null) return opt;
        if (image.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("Imagem muito grande, máx 5MB");
        }

        String ct = image.getContentType();
        if (ct == null || !ct.toLowerCase().startsWith("image/")) {
            throw new IllegalArgumentException("Tipo de arquivo inválido");
        }

    Path imagesDir = Paths.get(imagesDirPath);
        if (!Files.exists(imagesDir)) Files.createDirectories(imagesDir);

        // remove previous photo if exists and not the default
        User u = opt.get();
        String prev = u.getPhoto();
        if (prev != null && !prev.isBlank() && !"no-user.png".equals(prev)) {
            try {
                Path prevPath = imagesDir.resolve(Paths.get(prev).getFileName());
                Files.deleteIfExists(prevPath);
            } catch (Exception ex) {
                // ignore deletion errors
            }
        }

        String orig = image.getOriginalFilename();
        String ext = "";
        if (orig != null && orig.contains(".")) ext = orig.substring(orig.lastIndexOf('.'));

        String filename = UUID.randomUUID().toString() + ext;
        Path target = imagesDir.resolve(filename);
        Files.copy(image.getInputStream(), target);

        u.setPhoto(filename);
        usersRepository.save(u);

        return Optional.of(u);
    }
}
