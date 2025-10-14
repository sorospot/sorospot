package br.com.sorospot.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginController {

    @GetMapping("/login")
    public String mostrarFormularioLogin(Model model) {
        model.addAttribute("pageTitle", "Login - Sorospot");
        model.addAttribute("contentTemplate", "login/form");
        return "login/registro";
    }

    @PostMapping("/login")
    public String processarLogin(
            @RequestParam("email") String email,
            @RequestParam("senha") String senha,
            Model model) {
        
        return "redirect:/";
    }
}
