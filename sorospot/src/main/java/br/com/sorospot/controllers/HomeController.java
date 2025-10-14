package br.com.sorospot.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("pageTitle", "Página Inicial");
        model.addAttribute("contentTemplate", "exemplos/home");
        return "exemplos/layout";
    }

    @Value("${google.maps.apiKey}")
    private String googleMapsApiKey;

    @GetMapping("/mapa")
    public String mapa(Model model) {
        model.addAttribute("pageTitle", "Mapa");
        model.addAttribute("contentTemplate", "exemplos/map");
        model.addAttribute("googleMapsApiKey", googleMapsApiKey);
        return "exemplos/layout";
    }
}