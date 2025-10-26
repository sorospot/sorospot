package br.com.sorospot.controllers;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(Model model, HttpSession session) {
        model.addAttribute("pageTitle", "Página Inicial");
        model.addAttribute("contentTemplate", "exemplos/home");
        
        String userName = (String) session.getAttribute("userName");
        if (userName != null) {
            model.addAttribute("userName", userName);
            model.addAttribute("isLoggedIn", true);
        } else {
            model.addAttribute("isLoggedIn", false);
        }
        
        return "exemplos/layout";
    }
}