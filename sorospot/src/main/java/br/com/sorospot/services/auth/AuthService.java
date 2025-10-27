package br.com.sorospot.services.auth;

import br.com.sorospot.domains.UserRole;
import br.com.sorospot.domains.User;
import br.com.sorospot.dtos.auth.RegisterDTO;
import br.com.sorospot.exceptions.auth.AuthenticationException;
import br.com.sorospot.exceptions.auth.CpfAlreadyExistsException;
import br.com.sorospot.exceptions.auth.EmailAlreadyExistsException;
import br.com.sorospot.exceptions.auth.PasswordMismatchException;
import br.com.sorospot.repositories.user.UserRoleRepository;
import br.com.sorospot.repositories.user.UsersRepository;
import br.com.sorospot.services.validation.ValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private ValidationService validationService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public User register(RegisterDTO registerDTO) {
        // Validar campos do DTO
        validationService.validateRegisterDTO(registerDTO);

        // Validar se email já existe
        if (usersRepository.existsByEmail(registerDTO.getEmail().toLowerCase())) {
            throw new EmailAlreadyExistsException("Este email já está cadastrado no sistema");
        }

        // Validar se CPF já existe
        String cpfLimpo = registerDTO.getCpf().replaceAll("[^0-9]", "");
        if (usersRepository.existsByCpf(cpfLimpo)) {
            throw new CpfAlreadyExistsException("Este CPF já está cadastrado no sistema");
        }

        // Validar se as senhas coincidem
        if (!registerDTO.getPassword().equals(registerDTO.getConfirmPassword())) {
            throw new PasswordMismatchException("As senhas não coincidem");
        }

        // Buscar ou criar role padrão (USER)
        UserRole userRole = userRoleRepository.findByUserRole("USER")
                .orElseGet(() -> createDefaultUserRole());

        // Criar novo usuário
        User user = new User();
        user.setName(registerDTO.getName().trim() + " " + registerDTO.getLastName().trim());
        user.setCpf(cpfLimpo);
        user.setTelephone(registerDTO.getTelephone().replaceAll("[^0-9]", ""));
        user.setEmail(registerDTO.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setRole(userRole);
        user.setDeleted(false);
        user.setCreatedAt(LocalDateTime.now());

        return usersRepository.save(user);
    }

    private UserRole createDefaultUserRole() {
        UserRole role = new UserRole();
        role.setUserRole("USER");
        role.setDeleted(false);
        role.setCreatedAt(LocalDateTime.now());
        return userRoleRepository.save(role);
    }

    public User authenticate(String email, String password) {
        if (email == null || email.trim().isEmpty()) {
            throw new AuthenticationException("Email é obrigatório");
        }
        
        if (password == null || password.trim().isEmpty()) {
            throw new AuthenticationException("Senha é obrigatória");
        }

        Optional<User> userOpt = usersRepository.findByEmailAndDeletedFalse(email.toLowerCase().trim());
        
        if (!userOpt.isPresent()) {
            throw new AuthenticationException("Email ou senha inválidos");
        }

        User user = userOpt.get();
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthenticationException("Email ou senha inválidos");
        }

        return user;
    }

    public User getUserByEmail(String email) {
        return usersRepository.findByEmailAndDeletedFalse(email.toLowerCase().trim()).orElse(null);
    }
}
