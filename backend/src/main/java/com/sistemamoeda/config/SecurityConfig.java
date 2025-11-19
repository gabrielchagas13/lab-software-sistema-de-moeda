package com.sistemamoeda.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Injete seu UserDetailsService customizado
    private final UserDetailsService userDetailsService; 
    // Injete o filtro JWT que você acabou de criar
    private final JwtAuthenticationFilter jwtAuthFilter;
    
    // (Opcional) Injete seu CORS
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(UserDetailsService userDetailsService, 
                          JwtAuthenticationFilter jwtAuthFilter, 
                          CorsConfigurationSource corsConfigurationSource) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthFilter = jwtAuthFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        
        .authorizeHttpRequests(auth -> auth
            
                .requestMatchers("/api/auth/**", "/api/h2-console/**").permitAll() 
                .requestMatchers(HttpMethod.GET, "/api/instituicoes").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/alunos", "/api/professores", "/api/empresas").permitAll()


                .requestMatchers(HttpMethod.GET, "/api/alunos/**").hasAnyRole("ALUNO", "PROFESSOR", "ADMIN")                
                .requestMatchers(HttpMethod.GET, "/api/empresas/**").hasAnyRole("EMPRESA", "ALUNO", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/vantagens/**").hasAnyRole("EMPRESA", "ALUNO", "ADMIN")
                
                .requestMatchers(HttpMethod.GET, "/api/transacoes/**").hasAnyRole("PROFESSOR", "ALUNO", "ADMIN")

                .requestMatchers(HttpMethod.POST, "/api/transacoes/enviar-moedas").hasAnyRole("PROFESSOR", "ADMIN")
                

                .requestMatchers(HttpMethod.POST, "/api/transacoes/resgatar-vantagem").hasAnyRole("ALUNO", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/transacoes/transferir-vantagem").hasAnyRole("ALUNO", "ADMIN")

                .requestMatchers("/api/alunos/**").hasAnyRole("ALUNO", "ADMIN") 
                .requestMatchers("/api/professores/**").hasAnyRole("PROFESSOR", "ADMIN")
                .requestMatchers("/api/empresas/**").hasAnyRole("EMPRESA", "ADMIN")
                .requestMatchers("/api/vantagens/**").hasAnyRole("EMPRESA", "ADMIN")
                .requestMatchers("/api/**").hasRole("ADMIN")

                .anyRequest().authenticated() 
        )
        .authenticationProvider(authenticationProvider()) 
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        
        .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable())); // H2

    return http.build();
}
}