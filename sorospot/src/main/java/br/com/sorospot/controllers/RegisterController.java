package br.com.sorospot.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class RegisterController {

    @GetMapping("/signUp")
    public String showRegisterForm(Model model) {
        model.addAttribute("pageTitle", "Sorospot | Registrar-se");
        model.addAttribute("contentTemplate", "signUp/_form");
        return "signUp/auth";
    }

    @PostMapping("/signUp")
    public String processRegister(
            @RequestParam("name") String name,
            @RequestParam("lastName") String lastName,
            @RequestParam("cpf") String cpf,
            @RequestParam("email") String email,
            @RequestParam("telephone") String telephone,
            @RequestParam("password") String password,
            @RequestParam("confirmPassword") String confirmPassword,
            Model model) {
        
        return "redirect:/signIn";
    }
}
