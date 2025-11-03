package br.com.sorospot.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpSession;

@Controller
public class ProfileController {
    @GetMapping("/perfil")
    public String perfil(Model model, HttpSession session) {
        // Verificar login
        Object loggedUser = session.getAttribute("loggedUser");
        if (loggedUser == null) {
            return "redirect:/signIn";
        }
        
        // Adicionar atributos do modelo
        model.addAttribute("pageTitle", "Meu Perfil");
        model.addAttribute("contentTemplate", "profile/_infos");
        model.addAttribute("userName", session.getAttribute("userName"));
        model.addAttribute("userEmail", session.getAttribute("userEmail"));
        model.addAttribute("userCPF", session.getAttribute("userCPF"));
        model.addAttribute("userTelephone", session.getAttribute("userTelephone"));
        model.addAttribute("userPhoto", session.getAttribute("userPhoto"));
        
        return "profile/profile";
    }
}