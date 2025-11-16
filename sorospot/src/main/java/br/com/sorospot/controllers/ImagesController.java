package br.com.sorospot.controllers;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/images")
public class ImagesController {

    // Serve images from the configured images folder (defaults to project's static/images)
    private final Path imagesRoot;

    public ImagesController(@Value("${app.images.path:src/main/resources/static/images}") String imagesPath) {
        this.imagesRoot = Paths.get(imagesPath).toAbsolutePath();
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) throws MalformedURLException {
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            return ResponseEntity.badRequest().build();
        }
        Path file = imagesRoot.resolve(filename);
        if (file.toFile().exists()) {
            Resource res = new UrlResource(file.toUri());
            return ResponseEntity.ok().cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS)).body(res);
        }

        // fallback to classpath static images (e.g., no-user.png)
        ClassPathResource cp = new ClassPathResource("static/images/" + filename);
        try {
            if (cp.exists() && cp.getFile().exists()) {
                return ResponseEntity.ok().cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS)).body(cp);
            }
        } catch (Exception ignore) {
            // ignore and fall through to not found
        }

        return ResponseEntity.notFound().build();
    }
}
