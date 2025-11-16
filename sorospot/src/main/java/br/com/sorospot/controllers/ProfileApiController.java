package br.com.sorospot.controllers;

import br.com.sorospot.domains.User;
import br.com.sorospot.services.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import br.com.sorospot.repositories.user.UsersRepository;
import br.com.sorospot.services.validation.ValidationService;
import java.util.Map;
import java.util.Optional;

@RestController
public class ProfileApiController {

    private final ProfileService profileService;
    private final UsersRepository usersRepository;
    private final ValidationService validationService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public ProfileApiController(ProfileService profileService, UsersRepository usersRepository, ValidationService validationService) {
        this.profileService = profileService;
        this.usersRepository = usersRepository;
        this.validationService = validationService;
    }

    @PutMapping("/api/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> payload,
                                           @RequestHeader(value = "X-User-Email", required = false) String headerEmail,
                                           HttpSession session) {

        String userEmail = null;
        if (headerEmail != null && !headerEmail.isBlank()) {
            userEmail = headerEmail.trim().toLowerCase();
        } else {
            Object s = session.getAttribute("userEmail");
            if (s instanceof String) userEmail = ((String) s).trim().toLowerCase();
        }

        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado");
        }

        try {
            Optional<User> updatedOpt = profileService.updateProfileByEmail(userEmail, payload);
            if (updatedOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
            }

            User user = updatedOpt.get();

            // if email changed, update session
            if (user.getEmail() != null) {
                try { session.setAttribute("userEmail", user.getEmail()); } catch (Exception ignore) {}
            }

            return ResponseEntity.ok(Map.of(
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "telephone", user.getTelephone(),
                    "cpf", user.getCpf()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping(path = "/api/profile/photo", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadProfilePhoto(@RequestParam("image") MultipartFile image,
                                                @RequestHeader(value = "X-User-Email", required = false) String headerEmail,
                                                HttpSession session) {
        String userEmail = null;
        if (headerEmail != null && !headerEmail.isBlank()) {
            userEmail = headerEmail.trim().toLowerCase();
        } else {
            Object s = session.getAttribute("userEmail");
            if (s instanceof String) userEmail = ((String) s).trim().toLowerCase();
        }

        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado");
        }

        try {
            Optional<User> updated = profileService.updateProfilePhoto(userEmail, image);
            if (updated.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");
            User u = updated.get();
            try { session.setAttribute("userPhoto", u.getPhoto()); } catch (Exception ignore) {}
            return ResponseEntity.ok(Map.of("photo", u.getPhoto()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao salvar imagem");
        }
    }

    @PostMapping(path = "/api/profile/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> payload,
                                            @RequestHeader(value = "X-User-Email", required = false) String headerEmail,
                                            HttpSession session) {
        String userEmail = null;
        if (headerEmail != null && !headerEmail.isBlank()) {
            userEmail = headerEmail.trim().toLowerCase();
        } else {
            Object s = session.getAttribute("userEmail");
            if (s instanceof String) userEmail = ((String) s).trim().toLowerCase();
        }

        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado");
        }

        String password = payload.getOrDefault("password", "").trim();
        String confirm = payload.getOrDefault("confirmPassword", "").trim();

        if (password.isBlank() || confirm.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Ambas as senhas devem ser preenchidas");
        }
        if (!password.equals(confirm)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("As senhas não coincidem");
        }
        if (password.length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Senha deve ter ao menos 6 caracteres");
        }
        if (!validationService.isPasswordStrong(password)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número");
        }

        Optional<User> uopt = usersRepository.findByEmailAndDeletedFalse(userEmail);
        if (uopt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");

        User u = uopt.get();
        u.setPassword(passwordEncoder.encode(password));
        usersRepository.save(u);

        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
