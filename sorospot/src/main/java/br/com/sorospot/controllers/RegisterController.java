package br.com.sorospot.controllers;

import br.com.sorospot.dtos.auth.RegisterDTO;
import br.com.sorospot.exceptions.auth.CpfAlreadyExistsException;
import br.com.sorospot.exceptions.auth.EmailAlreadyExistsException;
import br.com.sorospot.exceptions.auth.PasswordMismatchException;
import br.com.sorospot.exceptions.validation.ValidationException;
import br.com.sorospot.services.auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class RegisterController {

    @Autowired
    private AuthService authService;

    @GetMapping("/signUp")
    public String showRegisterForm(Model model) {
        prepareRegisterModel(model, new RegisterDTO());
        return "signUp/auth";
    }

    @PostMapping("/signUp")
    public String processRegister(
            @ModelAttribute RegisterDTO registerDTO,
            RedirectAttributes redirectAttributes,
            Model model) {
        
        try {
            authService.register(registerDTO);
            redirectAttributes.addFlashAttribute("successMessage", "Cadastro realizado com sucesso! Faça login.");
            return "redirect:/signIn";
        } catch (ValidationException e) {
            model.addAttribute("errorMessages", e.getErrors());
            prepareRegisterModel(model, registerDTO);
            return "signUp/auth";
        } catch (EmailAlreadyExistsException | CpfAlreadyExistsException | PasswordMismatchException e) {
            model.addAttribute("errorMessage", e.getMessage());
            prepareRegisterModel(model, registerDTO);
            return "signUp/auth";
        } catch (Exception e) {
            model.addAttribute("errorMessage", "Erro ao processar cadastro. Tente novamente.");
            prepareRegisterModel(model, registerDTO);
            return "signUp/auth";
        }
    }

    private void prepareRegisterModel(Model model, RegisterDTO registerDTO) {
        model.addAttribute("pageTitle", "Sorospot | Registrar-se");
        model.addAttribute("contentTemplate", "signUp/_form");
        model.addAttribute("registerDTO", registerDTO);
    }
}