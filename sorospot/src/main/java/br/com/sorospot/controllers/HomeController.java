package br.com.sorospot.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/exemplos")
    public String home(Model model) {
        model.addAttribute("pageTitle", "Página Inicial");
        model.addAttribute("contentTemplate", "exemplos/home");
        return "exemplos/layout";
    }
}