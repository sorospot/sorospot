package br.com.sorospot.controllers;

import br.com.sorospot.domains.Occurrence;
import br.com.sorospot.repositories.OccurrenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/occurrence")
public class OccurrenceController {

    @Autowired
    private OccurrenceRepository occurrenceRepository;

    @GetMapping("/show/{id}")
    public String show(@PathVariable Integer id, Model model) {
        Occurrence occurrence = occurrenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ocorrência não encontrada com ID: " + id));
        
        model.addAttribute("occurrence", occurrence);
        
        return "occurrence/show";
    }
}