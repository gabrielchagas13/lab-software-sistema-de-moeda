package com.sistemamoeda.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sistemamoeda.model.Usuario;
import com.sistemamoeda.repository.UsuarioRepository;
import com.sistemamoeda.service.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository; // Ou um service que faça isso

    //DTO (Data Transfer Object) simples para o corpo da requisição de login
    public record LoginRequest(String email, String senha) {}

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        
        String email = authentication.getName(); 
        
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return ResponseEntity.ok(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        // 1. O AuthenticationManager usa seu UserDetailsService para validar
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.senha())
        );

        // 2. Se a autenticação deu certo, gera o token
        if (authentication.isAuthenticated()) {
            String token = jwtService.generateToken(request.email());
            return ResponseEntity.ok(token);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou senha inválidos");
        }
    }
}