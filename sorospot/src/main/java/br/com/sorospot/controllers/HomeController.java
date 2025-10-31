package br.com.sorospot.controllers;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/home")
    public String home(HttpSession session, Model model) {
        if (session.getAttribute("loggedUser") == null) {
            return "redirect:/signIn";
        }

        model.addAttribute("pageTitle", "Home");
        model.addAttribute("contentTemplate", "exemplos/home");
        return "exemplos/layout";
    }
}