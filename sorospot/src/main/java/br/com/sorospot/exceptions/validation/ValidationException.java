package br.com.sorospot.exceptions.validation;

import java.util.ArrayList;
import java.util.List;

public class ValidationException extends RuntimeException {
    private final List<String> errors;

    public ValidationException(String message) {
        super(message);
        this.errors = new ArrayList<>();
        this.errors.add(message);
    }

    public ValidationException(List<String> errors) {
        super("Erros de validação");
        this.errors = errors;
    }

    public List<String> getErrors() {
        return errors;
    }
}
