package br.com.sorospot.services;

import br.com.sorospot.domains.User;
import br.com.sorospot.domains.UserRole;
import br.com.sorospot.repositories.UserRepository;
import br.com.sorospot.repositories.UserRoleRepository;
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
        final String headerEmail = (userEmail != null && !userEmail.isBlank()) 
                ? userEmail : "demo@sorospot.local";
        
        // tenta achar um usuario
        User found = null;
        for (User u : userRepository.findAll()) {
            if (headerEmail.equals(u.getEmail())) {
                found = u;
                break;
            }
        }
        
        // senao cria um
        if (found == null) {
            User nu = new User();
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
            
            // tenta colocar o role do user
            UserRole userRole = getOrCreateUserRole();
            nu.setRole(userRole);
            
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
}