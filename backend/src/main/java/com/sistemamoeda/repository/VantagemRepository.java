package com.sistemamoeda.repository;

import com.sistemamoeda.model.Vantagem;
import com.sistemamoeda.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface VantagemRepository extends JpaRepository<Vantagem, Long> {
    
    // Buscar por empresa
    List<Vantagem> findByEmpresa(Empresa empresa);
    
    // Buscar por empresa ID
    List<Vantagem> findByEmpresaId(Long empresaId);
    
    // Buscar vantagens ativas
    List<Vantagem> findByAtivaTrue();
    
    // Buscar vantagens ativas por empresa
    List<Vantagem> findByEmpresaIdAndAtivaTrue(Long empresaId);
    
    // Buscar por nome (busca parcial, case insensitive)
    @Query("SELECT v FROM Vantagem v WHERE LOWER(v.nome) LIKE LOWER(CONCAT('%', :nome, '%'))")
    List<Vantagem> findByNomeContainingIgnoreCase(@Param("nome") String nome);
    
    // Buscar vantagens ativas por nome
    @Query("SELECT v FROM Vantagem v WHERE v.ativa = true AND LOWER(v.nome) LIKE LOWER(CONCAT('%', :nome, '%'))")
    List<Vantagem> findByAtivoTrueAndNomeContainingIgnoreCase(@Param("nome") String nome);
    
    // Buscar por faixa de preço
    List<Vantagem> findByCustoMoedasBetween(BigDecimal custoMinimo, BigDecimal custoMaximo);
    
    // Buscar vantagens ativas por faixa de preço
    List<Vantagem> findByAtivaTrueAndCustoMoedasBetween(BigDecimal custoMinimo, BigDecimal custoMaximo);
    
    // Contar vantagens por empresa
    @Query("SELECT COUNT(v) FROM Vantagem v WHERE v.empresa.id = :empresaId")
    Long countVantagensByEmpresaId(@Param("empresaId") Long empresaId);
    
    // Buscar vantagens com custo menor ou igual a um valor (que o aluno pode pagar)
    @Query("SELECT v FROM Vantagem v WHERE v.ativa = true AND v.custoMoedas <= :saldoAluno ORDER BY v.custoMoedas ASC")
    List<Vantagem> findVantagensQueAlunoConseguePagar(@Param("saldoAluno") BigDecimal saldoAluno);
    
    // Buscar por descrição (busca parcial, case insensitive)
    @Query("SELECT v FROM Vantagem v WHERE LOWER(v.descricao) LIKE LOWER(CONCAT('%', :descricao, '%'))")
    List<Vantagem> findByDescricaoContainingIgnoreCase(@Param("descricao") String descricao);
    
    // Buscar vantagens mais baratas (ordenadas por custo crescente)
    @Query("SELECT v FROM Vantagem v WHERE v.ativa = true ORDER BY v.custoMoedas ASC")
    List<Vantagem> findVantagensOrdemCrescente();
    
    // Buscar vantagens mais caras (ordenadas por custo decrescente)
    @Query("SELECT v FROM Vantagem v WHERE v.ativa = true ORDER BY v.custoMoedas DESC")
    List<Vantagem> findVantagensOrdemDecrescente();
    
    // Estatísticas - custo médio das vantagens por empresa
    @Query("SELECT AVG(v.custoMoedas) FROM Vantagem v WHERE v.empresa.id = :empresaId AND v.ativa = true")
    BigDecimal findCustoMedioPorEmpresa(@Param("empresaId") Long empresaId);
    
    // Estatísticas - vantagem mais cara por empresa
    @Query("SELECT MAX(v.custoMoedas) FROM Vantagem v WHERE v.empresa.id = :empresaId AND v.ativa = true")
    BigDecimal findCustoMaximoPorEmpresa(@Param("empresaId") Long empresaId);
    
    // Estatísticas - vantagem mais barata por empresa
    @Query("SELECT MIN(v.custoMoedas) FROM Vantagem v WHERE v.empresa.id = :empresaId AND v.ativa = true")
    BigDecimal findCustoMinimoPorEmpresa(@Param("empresaId") Long empresaId);
}