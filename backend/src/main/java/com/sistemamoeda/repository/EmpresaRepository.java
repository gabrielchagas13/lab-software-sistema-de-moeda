package com.sistemamoeda.repository;

import com.sistemamoeda.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    
    // Buscar por CNPJ
    Optional<Empresa> findByCnpj(String cnpj);
    
    // Buscar por usuário ID
    Optional<Empresa> findByUsuarioId(Long usuarioId);
    
    // Buscar por email do usuário
    @Query("SELECT e FROM Empresa e WHERE e.usuario.email = :email")
    Optional<Empresa> findByUsuarioEmail(@Param("email") String email);
    
    // Verificar se CNPJ já existe
    boolean existsByCnpj(String cnpj);
    
    // Buscar por nome fantasia (busca parcial, case insensitive)
    @Query("SELECT e FROM Empresa e WHERE LOWER(e.nomeFantasia) LIKE LOWER(CONCAT('%', :nome, '%'))")
    List<Empresa> findByNomeFantasiaContainingIgnoreCase(@Param("nome") String nome);
    
    // Buscar por nome do usuário
    @Query("SELECT e FROM Empresa e WHERE LOWER(e.usuario.nome) LIKE LOWER(CONCAT('%', :nome, '%'))")
    List<Empresa> findByUsuarioNomeContainingIgnoreCase(@Param("nome") String nome);
    
    // Buscar empresas que têm vantagens ativas
    @Query("SELECT DISTINCT e FROM Empresa e JOIN e.vantagens v WHERE v.ativa = true")
    List<Empresa> findEmpresasComVantagensAtivas();
    
    // Buscar por descrição (busca parcial, case insensitive)
    @Query("SELECT e FROM Empresa e WHERE LOWER(e.descricao) LIKE LOWER(CONCAT('%', :descricao, '%'))")
    List<Empresa> findByDescricaoContainingIgnoreCase(@Param("descricao") String descricao);
    
    // Contar vantagens por empresa
    @Query("SELECT COUNT(v) FROM Vantagem v WHERE v.empresa.id = :empresaId")
    Long countVantagensByEmpresaId(@Param("empresaId") Long empresaId);
    
    // Contar vantagens ativas por empresa
    @Query("SELECT COUNT(v) FROM Vantagem v WHERE v.empresa.id = :empresaId AND v.ativa = true")
    Long countVantagensAtivasByEmpresaId(@Param("empresaId") Long empresaId);
    
    // Buscar empresas por telefone
    Optional<Empresa> findByTelefone(String telefone);
    
    // Buscar empresas ordenadas por data de cadastro
    @Query("SELECT e FROM Empresa e ORDER BY e.dataCadastro DESC")
    List<Empresa> findAllOrderByDataCadastroDesc();
}