package br.com.sorospot.controllers;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(HttpSession session) {
        String userName = (String) session.getAttribute("userName");
        if (userName != null) {
            return "redirect:/home";
        }
        return "redirect:/signIn";
    }

    @GetMapping("/home")
    public String homePage(Model model, HttpSession session) {
        String userName = (String) session.getAttribute("userName");
        if (userName == null) {
            return "redirect:/signIn";
        }

        model.addAttribute("pageTitle", "Página Inicial");
        model.addAttribute("contentTemplate", "exemplos/home");
        model.addAttribute("userName", userName);
        model.addAttribute("isLoggedIn", true);
        
        return "exemplos/layout";
    }
}