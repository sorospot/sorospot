package br.com.sorospot.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginController {

    @GetMapping("/signIn")
    public String showLoginForm(Model model) {
        model.addAttribute("pageTitle", "Login - Sorospot");
        model.addAttribute("contentTemplate", "signIn/_form");
        return "signIn/auth";
    }

    @PostMapping("/signIn")
    public String processLogin(
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            Model model) {
        
        return "redirect:/";
    }
}
