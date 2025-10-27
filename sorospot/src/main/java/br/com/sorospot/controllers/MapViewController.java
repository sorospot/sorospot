package br.com.sorospot.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/mapa")
public class MapViewController {
    
    @Value("${google.maps.apiKey}")
    private String googleMapsApiKey;

    @GetMapping
    public String showMap(Model model) {
        model.addAttribute("pageTitle", "Mapa");
        model.addAttribute("contentTemplate", "Index/_map");
        model.addAttribute("googleMapsApiKey", googleMapsApiKey);
        model.addAttribute("currentUserEmail", "demo@sorospot.local");
        return "Index/index";
    }
}