package com.sistemamoeda.repository;

import com.sistemamoeda.model.Instituicao;
import com.sistemamoeda.model.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    
    // Buscar por CPF
    Optional<Professor> findByCpf(String cpf);
    
    // Buscar por usuário ID
    Optional<Professor> findByUsuarioId(Long usuarioId);
    
    // Buscar por email do usuário
    @Query("SELECT p FROM Professor p WHERE p.usuario.email = :email")
    Optional<Professor> findByUsuarioEmail(@Param("email") String email);
    
    // Verificar se CPF já existe
    boolean existsByCpf(String cpf);
    
    // Buscar por instituição
    List<Professor> findByInstituicao(Instituicao instituicao);
    
    // Buscar por nome da instituição contendo texto (case insensitive)
    @Query("SELECT p FROM Professor p WHERE LOWER(p.instituicao.nome) LIKE LOWER(CONCAT('%', :nomeInstituicao, '%'))")
    List<Professor> findByInstituicaoNomeContainingIgnoreCase(@Param("nomeInstituicao") String nomeInstituicao);
    
    // Buscar por departamento
    List<Professor> findByDepartamentoContainingIgnoreCase(String departamento);
    
    // Buscar por nome do usuário
    @Query("SELECT p FROM Professor p WHERE LOWER(p.usuario.nome) LIKE LOWER(CONCAT('%', :nome, '%'))")
    List<Professor> findByUsuarioNomeContainingIgnoreCase(@Param("nome") String nome);
    
    // Buscar professores por nome da instituição e departamento
    @Query("SELECT p FROM Professor p WHERE LOWER(p.instituicao.nome) LIKE LOWER(CONCAT('%', :nomeInstituicao, '%')) AND LOWER(p.departamento) LIKE LOWER(CONCAT('%', :departamento, '%'))")
    List<Professor> findByInstituicaoNomeAndDepartamento(@Param("nomeInstituicao") String nomeInstituicao, @Param("departamento") String departamento);
    
    // Buscar professores com saldo maior que um valor específico
    List<Professor> findBySaldoMoedasGreaterThan(BigDecimal valor);
    
    // Buscar professores com saldo entre valores
    List<Professor> findBySaldoMoedasBetween(BigDecimal minimo, BigDecimal maximo);
    
    // Estatísticas - total de professores por instituição
    @Query("SELECT COUNT(p) FROM Professor p WHERE p.instituicao = :instituicao")
    Long countByInstituicao(@Param("instituicao") Instituicao instituicao);
    
    // Estatísticas - soma total de moedas de todos os professores
    @Query("SELECT COALESCE(SUM(p.saldoMoedas), 0) FROM Professor p")
    BigDecimal sumTotalSaldoMoedas();
    
    // Professores com menor saldo (que precisam de recarga semestral)
    @Query("SELECT p FROM Professor p ORDER BY p.saldoMoedas ASC")
    List<Professor> findOrderBySaldoMoedasAsc();
    
    // Buscar professores com saldo menor que um valor específico
    List<Professor> findBySaldoMoedasLessThan(BigDecimal valor);
}