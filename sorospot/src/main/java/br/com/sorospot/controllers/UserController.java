package br.com.sorospot.controllers;

import br.com.sorospot.domains.User;
import br.com.sorospot.repositories.OccurrenceRepository;
import br.com.sorospot.repositories.UserRepository;
import br.com.sorospot.services.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@Controller
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final OccurrenceRepository occurrenceRepository;
    private final UserService userService;

    public UserController(UserRepository userRepository, OccurrenceRepository occurrenceRepository, UserService userService) {
        this.userRepository = userRepository;
        this.occurrenceRepository = occurrenceRepository;
        this.userService = userService;
    }

    @GetMapping("/{email}")
    public String profilePage(@PathVariable("email") String email, Model model, HttpSession session) {
        User user = findByEmail(email);
        if (user == null) {
            return "redirect:/"; // fallback
        }
        long totalPins = occurrenceRepository.countByUser_EmailAndDeletedFalse(user.getEmail());
        model.addAttribute("profileUser", user);
        model.addAttribute("totalPins", totalPins);
        
        // Verificar se usuário da sessão é admin
        String sessionEmail = session != null ? (String) session.getAttribute("userEmail") : null;
        boolean isAdmin = false;
        if (sessionEmail != null && !sessionEmail.isBlank()) {
            User currentUser = userService.findOrCreateUser(sessionEmail);
            isAdmin = userService.isAdmin(currentUser);
            model.addAttribute("currentUserEmail", sessionEmail);
        }
        model.addAttribute("isAdmin", isAdmin);
        
        return "users/profile";
    }

    private User findByEmail(String email) {
        if (email == null) return null;
        String norm = email.trim().toLowerCase();
        for (User u : userRepository.findByDeletedFalse()) {
            if (u.getEmail() != null && norm.equals(u.getEmail().trim().toLowerCase())) {
                return u;
            }
        }
        return null;
    }
}

@RestController
@RequestMapping("/api/users")
class UserApiController {

    private final UserRepository userRepository;
    private final OccurrenceRepository occurrenceRepository;
    private final UserService userService;

    public UserApiController(UserRepository userRepository, OccurrenceRepository occurrenceRepository, UserService userService) {
        this.userRepository = userRepository;
        this.occurrenceRepository = occurrenceRepository;
        this.userService = userService;
    }

    @GetMapping("/{email}")
    public ResponseEntity<?> profile(@PathVariable("email") String email) {
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email inválido");
        }
        String norm = email.trim().toLowerCase();
        User found = null;
        for (User u : userRepository.findByDeletedFalse()) {
            if (u.getEmail() != null && norm.equals(u.getEmail().trim().toLowerCase())) {
                found = u;
                break;
            }
        }
        if (found == null) {
            return ResponseEntity.notFound().build();
        }
        long totalPins = occurrenceRepository.countByUser_EmailAndDeletedFalse(found.getEmail());
        return ResponseEntity.ok(new UserProfileDTO(found.getName(), found.getEmail(), found.getPhoto(), found.getRole() != null ? found.getRole().getUserRole() : null, totalPins));
    }

    @PutMapping("/{email}/edit")
    public ResponseEntity<?> updateUser(@PathVariable("email") String email,
                                        @RequestBody Map<String, String> updates,
                                        HttpSession session) {
        String sessionEmail = session != null ? (String) session.getAttribute("userEmail") : null;
        if (sessionEmail == null || sessionEmail.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Verifica se é admin usando UserService
        User currentUser = userService.findOrCreateUser(sessionEmail);
        if (currentUser == null || !userService.isAdmin(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String norm = email.trim().toLowerCase();
        User found = null;
        for (User u : userRepository.findByDeletedFalse()) {
            if (u.getEmail() != null && norm.equals(u.getEmail().trim().toLowerCase())) {
                found = u;
                break;
            }
        }
        if (found == null) {
            return ResponseEntity.notFound().build();
        }

        if (updates.containsKey("name")) found.setName(updates.get("name"));
        if (updates.containsKey("telephone")) found.setTelephone(updates.get("telephone"));
        if (updates.containsKey("cpf")) found.setCpf(updates.get("cpf"));

        userRepository.save(found);
        return ResponseEntity.ok(Map.of("success", true, "message", "Usuário atualizado com sucesso"));
    }

    @DeleteMapping("/{email}/delete")
    public ResponseEntity<?> deleteUser(@PathVariable("email") String email, HttpSession session) {
        String sessionEmail = session != null ? (String) session.getAttribute("userEmail") : null;
        if (sessionEmail == null || sessionEmail.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Verifica se é admin usando UserService
        User currentUser = userService.findOrCreateUser(sessionEmail);
        if (currentUser == null || !userService.isAdmin(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String norm = email.trim().toLowerCase();
        User found = null;
        for (User u : userRepository.findByDeletedFalse()) {
            if (u.getEmail() != null && norm.equals(u.getEmail().trim().toLowerCase())) {
                found = u;
                break;
            }
        }
        if (found == null) {
            return ResponseEntity.notFound().build();
        }

        // Deletar todos os pins do usuário (soft delete)
        var userOccurrences = occurrenceRepository.findByUser_IdAndDeletedFalse(found.getId());
        System.out.println("[DELETE USER] Deletando " + userOccurrences.size() + " pins do usuário " + found.getEmail());
        for (var occurrence : userOccurrences) {
            occurrence.setDeleted(true);
            occurrenceRepository.save(occurrence);
        }

        // Soft delete do usuário
        System.out.println("[DELETE USER] Before: email=" + found.getEmail() + ", deleted=" + found.getDeleted());
        found.setDeleted(true);
        User saved = userRepository.save(found);
        System.out.println("[DELETE USER] After save: email=" + saved.getEmail() + ", deleted=" + saved.getDeleted());
        return ResponseEntity.noContent().build();
    }

    static class UserProfileDTO {
        public String name;
        public String email;
        public String photo;
        public String role;
        public long totalPins;
        public UserProfileDTO(String name, String email, String photo, String role, long totalPins) {
            this.name = name;
            this.email = email;
            this.photo = photo;
            this.role = role;
            this.totalPins = totalPins;
        }
    }
}