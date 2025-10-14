package com.sistemamoeda.repository;

import com.sistemamoeda.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {
    
    // Buscar por CPF
    Optional<Aluno> findByCpf(String cpf);
    
    // Buscar por usuário ID
    Optional<Aluno> findByUsuarioId(Long usuarioId);
    
    // Buscar por email do usuário
    @Query("SELECT a FROM Aluno a WHERE a.usuario.email = :email")
    Optional<Aluno> findByUsuarioEmail(@Param("email") String email);
    
    // Verificar se CPF já existe
    boolean existsByCpf(String cpf);
    
    // Buscar por instituição (agora String)
    List<Aluno> findByInstituicao(String instituicao);
    
    // Buscar por instituição contendo texto (case insensitive)
    List<Aluno> findByInstituicaoContainingIgnoreCase(String instituicao);
    
    // Buscar por curso
    List<Aluno> findByCursoContainingIgnoreCase(String curso);
    
    // Buscar por nome do usuário
    @Query("SELECT a FROM Aluno a WHERE LOWER(a.usuario.nome) LIKE LOWER(CONCAT('%', :nome, '%'))")
    List<Aluno> findByUsuarioNomeContainingIgnoreCase(@Param("nome") String nome);
    
    // Buscar alunos com saldo maior que um valor específico
    List<Aluno> findBySaldoMoedasGreaterThan(BigDecimal valor);
    
    // Buscar alunos com saldo entre valores
    List<Aluno> findBySaldoMoedasBetween(BigDecimal minimo, BigDecimal maximo);
    
    // Buscar alunos por instituição e curso
    List<Aluno> findByInstituicaoContainingIgnoreCaseAndCursoContainingIgnoreCase(String instituicao, String curso);
    
    // Estatísticas - total de alunos por instituição
    @Query("SELECT COUNT(a) FROM Aluno a WHERE LOWER(a.instituicao) = LOWER(:instituicao)")
    Long countByInstituicao(@Param("instituicao") String instituicao);
    
    // Estatísticas - soma total de moedas de todos os alunos
    @Query("SELECT COALESCE(SUM(a.saldoMoedas), 0) FROM Aluno a")
    BigDecimal sumTotalSaldoMoedas();
    
    // Top alunos com maior saldo
    @Query("SELECT a FROM Aluno a ORDER BY a.saldoMoedas DESC")
    List<Aluno> findTopBySaldoMoedas();
}