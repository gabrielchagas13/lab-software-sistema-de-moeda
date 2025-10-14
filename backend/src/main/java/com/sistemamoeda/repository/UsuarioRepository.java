package com.sistemamoeda.repository;

import com.sistemamoeda.model.Usuario;
import com.sistemamoeda.model.TipoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Buscar por email (usado para login)
    Optional<Usuario> findByEmail(String email);
    
    // Buscar por email e senha (usado para autenticação)
    Optional<Usuario> findByEmailAndSenha(String email, String senha);
    
    // Verificar se email já existe
    boolean existsByEmail(String email);
    
    // Buscar por tipo de usuário
    List<Usuario> findByTipoUsuario(TipoUsuario tipoUsuario);
    
    // Buscar usuários ativos
    List<Usuario> findByAtivoTrue();
    
    // Buscar usuários ativos por tipo
    List<Usuario> findByAtivoTrueAndTipoUsuario(TipoUsuario tipoUsuario);
    
    // Buscar por nome (busca parcial, case insensitive)
    @Query("SELECT u FROM Usuario u WHERE LOWER(u.nome) LIKE LOWER(CONCAT('%', :nome, '%'))")
    List<Usuario> findByNomeContainingIgnoreCase(@Param("nome") String nome);
    
    // Buscar usuários criados em um período específico
    @Query("SELECT u FROM Usuario u WHERE u.dataCriacao BETWEEN :dataInicio AND :dataFim")
    List<Usuario> findByPeriodoCriacao(@Param("dataInicio") java.time.LocalDateTime dataInicio, 
                                      @Param("dataFim") java.time.LocalDateTime dataFim);
}