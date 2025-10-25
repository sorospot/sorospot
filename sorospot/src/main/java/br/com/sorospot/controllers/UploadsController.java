package br.com.sorospot.controllers;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/uploads")
public class UploadsController {

    private final Path uploadRoot = Paths.get("uploads").toAbsolutePath();

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getUpload(@PathVariable String filename) throws MalformedURLException {
        // segurança básica: evitar path traversal
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            return ResponseEntity.badRequest().build();
        }
        Path file = uploadRoot.resolve(filename);
        if (!file.toFile().exists()) return ResponseEntity.notFound().build();
        Resource res = new UrlResource(file.toUri());
        return ResponseEntity.ok().cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS)).body(res);
    }
}
