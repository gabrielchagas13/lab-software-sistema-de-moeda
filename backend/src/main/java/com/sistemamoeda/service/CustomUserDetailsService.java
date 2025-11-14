package com.sistemamoeda.service; 

import com.sistemamoeda.model.Usuario; 
import com.sistemamoeda.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        Usuario usuario = usuarioRepository.findByEmail(username)
                .orElseThrow(() -> 
                        new UsernameNotFoundException("Usuário não encontrado com o email: " + username));

        String role = "ROLE_" + usuario.getTipoUsuario().name();
        

        Collection<GrantedAuthority> authorities = Collections.singleton(new SimpleGrantedAuthority(role));

        return new User(
                usuario.getEmail(),
                usuario.getSenha(), 
                authorities                 
        );
    }
}