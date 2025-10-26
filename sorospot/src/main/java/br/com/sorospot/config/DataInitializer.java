package br.com.sorospot.config;

import br.com.sorospot.domain.UserRole;
import br.com.sorospot.domain.UserRoleEnum;
import br.com.sorospot.repositories.user.UserRoleRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer {

    @Autowired
    private UserRoleRepository userRoleRepository;

    @PostConstruct
    public void init() {
        initializeUserRoles();
    }

    private void initializeUserRoles() {
        for (UserRoleEnum roleEnum : UserRoleEnum.values()) {
            String roleName = roleEnum.getRole();
            if (!userRoleRepository.findByUserRole(roleName).isPresent()) {
                UserRole role = new UserRole();
                role.setUserRole(roleName);
                role.setDeleted(false);
                role.setCreatedAt(LocalDateTime.now());
                userRoleRepository.save(role);
                System.out.println("Role criada: " + roleName);
            }
        }
    }
}
