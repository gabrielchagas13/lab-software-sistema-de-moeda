package com.sistemamoeda.config;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// IMPORTAÇÃO DA SUA CLASSE - ajuste o 'service' se necessário
import com.sistemamoeda.service.JwtService;


@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserDetailsService userDetailsService; // O seu CustomUserDetailsService

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Pega o cabeçalho "Authorization"
        final String authHeader = request.getHeader("Authorization");

        // 2. Se não existir ou não começar com "Bearer ", passa para o próximo filtro
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extrai o token (ex: "Bearer eyJhbGci...")
        final String jwt = authHeader.substring(7); // "Bearer " tem 7 caracteres

        try {
            // 4. Extrai o email (username) do token
            final String userEmail = jwtService.extractUsername(jwt);

            // 5. Se o usuário existe E AINDA NÃO FOI AUTENTICADO
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // 6. Busca o usuário no banco (usando seu UserDetailsService)
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                // 7. Se o token for válido...
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // 8. CRIA a autenticação e COLOCA no Contexto de Segurança do Spring
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null, // Credenciais (senha) são nulas em auth por token
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
            filterChain.doFilter(request, response);
        
        } catch (ExpiredJwtException | MalformedJwtException e) {
            // Se o token estiver inválido ou expirado, não autentica
            // (pode customizar a resposta de erro aqui se quiser)
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token inválido ou expirado");
            response.getWriter().flush();
        }
    }
}