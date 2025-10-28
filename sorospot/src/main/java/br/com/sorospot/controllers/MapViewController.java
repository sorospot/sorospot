package br.com.sorospot.controllers;

import jakarta.servlet.http.HttpSession;
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
    public String showMap(Model model, HttpSession session){
        if (session == null || session.getAttribute("loggedUser") == null) {
            return "redirect:/signIn";
        }

        model.addAttribute("pageTitle", "Mapa");
        model.addAttribute("contentTemplate", "Index/_map");
        model.addAttribute("googleMapsApiKey", googleMapsApiKey);

        Object emailAttr = session != null ? session.getAttribute("userEmail") : null;
        if (emailAttr instanceof String && !((String) emailAttr).isBlank()) {
            model.addAttribute("currentUserEmail", (String) emailAttr);
        }
        return "Index/index";
    }
}