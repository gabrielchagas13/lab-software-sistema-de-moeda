package com.sistemamoeda.repository;

import com.sistemamoeda.model.Instituicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstituicaoRepository extends JpaRepository<Instituicao, Long> {
    
    // Buscar por nome exato
    Optional<Instituicao> findByNome(String nome);
    
    // Buscar instituições ativas
    List<Instituicao> findByAtivoTrue();
    
    // Buscar por nome (busca parcial, case insensitive)
    @Query("SELECT i FROM Instituicao i WHERE LOWER(i.nome) LIKE LOWER(CONCAT('%', :nome, '%'))")
    List<Instituicao> findByNomeContainingIgnoreCase(@Param("nome") String nome);
    
    // Buscar instituições ativas por nome
    @Query("SELECT i FROM Instituicao i WHERE i.ativo = true AND LOWER(i.nome) LIKE LOWER(CONCAT('%', :nome, '%'))")
    List<Instituicao> findByAtivoTrueAndNomeContainingIgnoreCase(@Param("nome") String nome);
    
    // Verificar se nome já existe
    boolean existsByNome(String nome);
    
    // Contar alunos por instituição
    @Query("SELECT COUNT(a) FROM Aluno a WHERE LOWER(a.instituicao) = LOWER(:instituicaoNome)")
    Long countAlunosByInstituicaoNome(@Param("instituicaoNome") String instituicaoNome);
    
    // Contar professores por instituição
    @Query("SELECT COUNT(p) FROM Professor p WHERE LOWER(p.instituicao) = LOWER(:instituicaoNome)")
    Long countProfessoresByInstituicaoNome(@Param("instituicaoNome") String instituicaoNome);
}