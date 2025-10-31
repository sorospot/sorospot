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
    public String showMap(HttpSession session, Model model) {
        // Verificar se o usuário está autenticado
        if (session.getAttribute("loggedUser") == null) {
            return "redirect:/signIn";
        }
        
        model.addAttribute("pageTitle", "Mapa");
        model.addAttribute("contentTemplate", "Index/_map");
        model.addAttribute("googleMapsApiKey", googleMapsApiKey);
        
        // Usar o email do usuário logado da sessão
        String userEmail = (String) session.getAttribute("userEmail");
        model.addAttribute("currentUserEmail", userEmail != null ? userEmail : "");
        
        return "Index/index";
    }
}