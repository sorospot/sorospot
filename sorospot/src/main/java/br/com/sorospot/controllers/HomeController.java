package br.com.sorospot.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/home")
    public String home(Model model) {
        model.addAttribute("pageTitle", "Home");
        model.addAttribute("contentTemplate", "exemplos/home.html");
        return "exemplos/layout.html";
    }
}