package com.sistemamoeda.config;

import com.sistemamoeda.model.TipoUsuario;
import com.sistemamoeda.model.Usuario;
import com.sistemamoeda.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner loadData(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin@gmail.com";
            
            if (!usuarioRepository.existsByEmail(adminEmail)) {
                
                Usuario admin = new Usuario(
                        "Admin",
                        adminEmail,
                        passwordEncoder.encode("admin123"),
                        TipoUsuario.ADMIN
                );
                
                usuarioRepository.save(admin);
                
                System.out.println(">>> Usuário ADMIN 'admin@gmail.com' criado com senha 'admin123' <<<");
            }
        };
    }
}