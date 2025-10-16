package br.com.sorospot.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class RegistroController {

    @GetMapping("/registro")
    public String mostrarFormularioRegistro(Model model) {
        model.addAttribute("pageTitle", "Registro de Usuário");
        model.addAttribute("contentTemplate", "registro/form");
        return "registro/registro";
    }

    @PostMapping("/registro")
    public String processarRegistro(
            @RequestParam("nome") String nome,
            @RequestParam("sobrenome") String sobrenome,
            @RequestParam("cpf") String cpf,
            @RequestParam("email") String email,
            @RequestParam("telefone") String telefone,
            @RequestParam("senha") String senha,
            @RequestParam("confirmarSenha") String confirmarSenha,
            Model model) {
        
        return "redirect:/login";
    }
}
