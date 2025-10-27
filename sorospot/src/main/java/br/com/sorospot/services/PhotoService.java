package br.com.sorospot.services;

import br.com.sorospot.domains.Occurrence;
import br.com.sorospot.domains.Photo;
import br.com.sorospot.repositories.PhotoRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;
import java.util.UUID;

@Service
public class PhotoService {

    private final PhotoRepository photoRepository;
    private static final long MAX_BYTES = 5L * 1024L * 1024L; // 5 MB
    private static final String UPLOAD_DIR = "uploads";

    public PhotoService(PhotoRepository photoRepository) {
        this.photoRepository = photoRepository;
    }

    public Photo savePhoto(MultipartFile image, Occurrence occurrence) throws IOException {
        if (image.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("Imagem muito grande, máx 5MB");
        }
        
        String ct = image.getContentType();
        if (ct == null || !ct.toLowerCase().startsWith("image/")) {
            throw new IllegalArgumentException("Imagem inválida, tipo inválido");
        }
        
        Path uploadDir = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
        
        String ext = "";
        String orig = image.getOriginalFilename();
        if (orig != null && orig.contains(".")) {
            ext = orig.substring(orig.lastIndexOf('.'));
        }
        
        String filename = UUID.randomUUID().toString() + ext;
        Path target = uploadDir.resolve(filename);
        Files.copy(image.getInputStream(), target);
        
        Photo ph = new Photo();
        ph.setFilename(filename);
        ph.setOccurrence(occurrence);
        
        return ph;
    }

    public void removePhotos(Occurrence occurrence, String removePhotos) {
        if (occurrence.getPhotos() == null || occurrence.getPhotos().isEmpty()) {
            return;
        }
        
        Set<String> removeSet = new HashSet<>();
        for (String r : removePhotos.split(",")) {
            String clean = Paths.get(r.trim()).getFileName().toString();
            if (!clean.isBlank()) {
                removeSet.add(clean);
            }
        }
        
        if (!removeSet.isEmpty()) {
            Iterator<Photo> it = occurrence.getPhotos().iterator();
            while (it.hasNext()) {
                Photo ph = it.next();
                if (ph == null || ph.getFilename() == null) continue;
                
                if (removeSet.contains(ph.getFilename())) {
                    try {
                        Files.deleteIfExists(Paths.get(UPLOAD_DIR).resolve(ph.getFilename()));
                    } catch (Exception ex) {
                        // ignore
                    }
                    it.remove();
                    if (ph.getId() != null) {
                        photoRepository.delete(ph);
                    }
                }
            }
        }
    }
}