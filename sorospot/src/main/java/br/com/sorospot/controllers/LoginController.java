package br.com.sorospot.controllers;

import br.com.sorospot.domains.User;
import br.com.sorospot.dtos.auth.LoginDTO;
import br.com.sorospot.exceptions.auth.AuthenticationException;
import br.com.sorospot.exceptions.validation.ValidationException;
import br.com.sorospot.services.auth.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class LoginController {

    @Autowired
    private AuthService authService;

    @GetMapping("/signIn")
    public String showLoginForm(HttpSession session, Model model) {
        if (session.getAttribute("loggedUser") != null) {
            return "redirect:/mapa";
        }
        prepareLoginModel(model, new LoginDTO());
        return "signIn/auth";
    }

    @PostMapping("/signIn")
    public String processLogin(
            @ModelAttribute LoginDTO loginDTO,
            HttpSession session,
            Model model) {
        
        try {
            User user = authService.authenticate(loginDTO.getEmail(), loginDTO.getPassword());
            
            if (user != null) {
                session.setAttribute("loggedUser", user);
                session.setAttribute("userName", user.getName());
                session.setAttribute("userEmail", user.getEmail());
                session.setAttribute("userRole", user.getRole().getUserRole());
                return "redirect:/mapa";
            }
        } catch (AuthenticationException e) {
            model.addAttribute("errorMessage", e.getMessage());
        } catch (ValidationException e) {
            model.addAttribute("errorMessages", e.getErrors());
        } catch (Exception e) {
            model.addAttribute("errorMessage", "Erro ao processar login. Tente novamente.");
        }
        
        prepareLoginModel(model, loginDTO);
        return "signIn/auth";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/signIn";
    }

    private void prepareLoginModel(Model model, LoginDTO loginDTO) {
        model.addAttribute("pageTitle", "Login - Sorospot");
        model.addAttribute("contentTemplate", "signIn/_form");
        model.addAttribute("loginDTO", loginDTO);
    }
}
