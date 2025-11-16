package br.com.sorospot.services.validation;

import br.com.sorospot.dtos.auth.LoginDTO;
import br.com.sorospot.dtos.auth.RegisterDTO;
import br.com.sorospot.exceptions.validation.ValidationException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class ValidationService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );
    
    private static final Pattern CPF_PATTERN = Pattern.compile("\\d{11}");
    private static final Pattern PHONE_PATTERN = Pattern.compile("\\d{10,11}");

    public void validateLoginDTO(LoginDTO loginDTO) {
        List<String> errors = new ArrayList<>();

        if (loginDTO.getEmail() == null || loginDTO.getEmail().trim().isEmpty()) {
            errors.add("O email é obrigatório");
        } else if (!isValidEmail(loginDTO.getEmail())) {
            errors.add("Email inválido");
        }

        if (loginDTO.getPassword() == null || loginDTO.getPassword().trim().isEmpty()) {
            errors.add("A senha é obrigatória");
        }

        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }
    }

    public void validateRegisterDTO(RegisterDTO registerDTO) {
        List<String> errors = new ArrayList<>();

        // Validar nome
        if (registerDTO.getName() == null || registerDTO.getName().trim().isEmpty()) {
            errors.add("O nome é obrigatório");
        } else if (registerDTO.getName().trim().length() < 2) {
            errors.add("O nome deve ter pelo menos 2 caracteres");
        }

        // Validar sobrenome
        if (registerDTO.getLastName() == null || registerDTO.getLastName().trim().isEmpty()) {
            errors.add("O sobrenome é obrigatório");
        } else if (registerDTO.getLastName().trim().length() < 2) {
            errors.add("O sobrenome deve ter pelo menos 2 caracteres");
        }

        // Validar CPF
        if (registerDTO.getCpf() == null || registerDTO.getCpf().trim().isEmpty()) {
            errors.add("O CPF é obrigatório");
        } else {
            String cpfLimpo = registerDTO.getCpf().replaceAll("[^0-9]", "");
            if (!CPF_PATTERN.matcher(cpfLimpo).matches()) {
                errors.add("CPF inválido (deve conter 11 dígitos)");
            } else if (!isValidCPF(cpfLimpo)) {
                errors.add("CPF inválido");
            }
        }

        // Validar email
        if (registerDTO.getEmail() == null || registerDTO.getEmail().trim().isEmpty()) {
            errors.add("O email é obrigatório");
        } else if (!isValidEmail(registerDTO.getEmail())) {
            errors.add("Email inválido");
        }

        // Validar telefone
        if (registerDTO.getTelephone() == null || registerDTO.getTelephone().trim().isEmpty()) {
            errors.add("O telefone é obrigatório");
        } else {
            String telefoneLimpo = registerDTO.getTelephone().replaceAll("[^0-9]", "");
            if (!PHONE_PATTERN.matcher(telefoneLimpo).matches()) {
                errors.add("Telefone inválido (deve conter 10 ou 11 dígitos)");
            }
        }

        // Validar senha
        if (registerDTO.getPassword() == null || registerDTO.getPassword().trim().isEmpty()) {
            errors.add("A senha é obrigatória");
        } else if (registerDTO.getPassword().length() < 6) {
            errors.add("A senha deve ter pelo menos 6 caracteres");
        } else if (!isPasswordStrong(registerDTO.getPassword())) {
            errors.add("A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número");
        }

        // Validar confirmação de senha
        if (registerDTO.getConfirmPassword() == null || registerDTO.getConfirmPassword().trim().isEmpty()) {
            errors.add("A confirmação de senha é obrigatória");
        } else if (!registerDTO.getPassword().equals(registerDTO.getConfirmPassword())) {
            errors.add("As senhas não coincidem");
        }

        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }
    }

    private boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    private boolean isValidCPF(String cpf) {
        // Remove caracteres não numéricos
        cpf = cpf.replaceAll("[^0-9]", "");

        // Verifica se tem 11 dígitos
        if (cpf.length() != 11) {
            return false;
        }

        // Verifica se todos os dígitos são iguais
        if (cpf.matches("(\\d)\\1{10}")) {
            return false;
        }

        // Calcula o primeiro dígito verificador
        int sum = 0;
        for (int i = 0; i < 9; i++) {
            sum += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
        }
        int firstDigit = 11 - (sum % 11);
        if (firstDigit >= 10) {
            firstDigit = 0;
        }

        // Verifica o primeiro dígito
        if (Character.getNumericValue(cpf.charAt(9)) != firstDigit) {
            return false;
        }

        // Calcula o segundo dígito verificador
        sum = 0;
        for (int i = 0; i < 10; i++) {
            sum += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
        }
        int secondDigit = 11 - (sum % 11);
        if (secondDigit >= 10) {
            secondDigit = 0;
        }

        // Verifica o segundo dígito
        return Character.getNumericValue(cpf.charAt(10)) == secondDigit;
    }

    public boolean isPasswordStrong(String password) {
        // Verifica se tem pelo menos uma letra maiúscula, uma minúscula e um número
        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        
        return hasUpper && hasLower && hasDigit;
    }
}
