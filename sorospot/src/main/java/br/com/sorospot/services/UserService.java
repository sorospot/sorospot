package br.com.sorospot.services;

import br.com.sorospot.domains.User;
import br.com.sorospot.domains.UserRole;
import br.com.sorospot.repositories.UserRepository;
import br.com.sorospot.repositories.user.UserRoleRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    public UserService(UserRepository userRepository, UserRoleRepository userRoleRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
    }

    public User findOrCreateUser(String userEmail) {
        // normalize incoming email to lower-case and trimmed to avoid duplicates
        final String headerEmail = (userEmail != null && !userEmail.isBlank())
                ? userEmail.trim().toLowerCase()
                : "demo@sorospot.local";

        // tenta achar um usuario
        User found = null;
        for (User u : userRepository.findAll()) {
            if (u.getEmail() != null && headerEmail.equals(u.getEmail().trim().toLowerCase())) {
                found = u;
                break;
            }
        }
        
        // senao cria um
        if (found == null) {
            User nu = new User();
            // store normalized email
            nu.setEmail(headerEmail);
            
            // seta um nome
            String name = headerEmail.contains("@") 
                    ? headerEmail.substring(0, headerEmail.indexOf('@')) 
                    : headerEmail;
            nu.setName(name);
            
            // Coloca alguns campos
            nu.setCpf("00000000000");
            nu.setTelephone("0000000000");
            
            // senha minima
            nu.setPassword("changeme");
            
            // Por padrão, novos usuários são USER
            nu.setRole(getOrCreateUserRole());
            
            found = userRepository.save(nu);
        }
        
        return found;
    }

    private UserRole getOrCreateUserRole() {
        UserRole userRole = null;
        for (UserRole r : userRoleRepository.findAll()) {
            if ("USER".equalsIgnoreCase(r.getUserRole())) {
                userRole = r;
                break;
            }
        }
        
        if (userRole == null) {
            UserRole r = new UserRole();
            r.setUserRole("USER");
            userRole = userRoleRepository.save(r);
        }
        
        return userRole;
    }

    public boolean isAdmin(User user) {
        return user != null && user.getRole() != null && user.getRole().getId() != null && user.getRole().getId() == 2;
    }
}