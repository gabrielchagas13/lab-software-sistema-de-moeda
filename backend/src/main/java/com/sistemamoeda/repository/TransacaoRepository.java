package com.sistemamoeda.repository;

import com.sistemamoeda.model.Transacao;
import com.sistemamoeda.model.TipoTransacao;
import com.sistemamoeda.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
    
    // Buscar por código do cupom
    Optional<Transacao> findByCodigoCupom(String codigoCupom);
    
    // Buscar por tipo de transação
    List<Transacao> findByTipoTransacao(TipoTransacao tipoTransacao);
    
    // Buscar transações por remetente
    List<Transacao> findByRemetente(Usuario remetente);
    
    // Buscar transações por destinatário
    List<Transacao> findByDestinatario(Usuario destinatario);
    
    // Extrato completo de um usuário (como remetente ou destinatário)
    @Query("SELECT t FROM Transacao t WHERE t.remetente = :usuario OR t.destinatario = :usuario ORDER BY t.dataTransacao DESC")
    List<Transacao> findExtratoUsuario(@Param("usuario") Usuario usuario);
    
    // Extrato de um usuário por período
    @Query("SELECT t FROM Transacao t WHERE (t.remetente = :usuario OR t.destinatario = :usuario) " +
           "AND t.dataTransacao BETWEEN :dataInicio AND :dataFim ORDER BY t.dataTransacao DESC")
    List<Transacao> findExtratoUsuarioPorPeriodo(@Param("usuario") Usuario usuario, 
                                                @Param("dataInicio") LocalDateTime dataInicio, 
                                                @Param("dataFim") LocalDateTime dataFim);
    
    // Buscar transações por período
    List<Transacao> findByDataTransacaoBetween(LocalDateTime dataInicio, LocalDateTime dataFim);
    
    // Buscar transações por tipo e período
    List<Transacao> findByTipoTransacaoAndDataTransacaoBetween(TipoTransacao tipoTransacao, 
                                                              LocalDateTime dataInicio, 
                                                              LocalDateTime dataFim);
    
    // Buscar transações de envio de moedas (professor -> aluno)
    @Query("SELECT t FROM Transacao t WHERE t.tipoTransacao = 'ENVIO_MOEDA' ORDER BY t.dataTransacao DESC")
    List<Transacao> findEnviosMoedas();
    
    // Buscar transações de resgate de vantagens
    @Query("SELECT t FROM Transacao t WHERE t.tipoTransacao = 'RESGATE_VANTAGEM' ORDER BY t.dataTransacao DESC")
    List<Transacao> findResgatesVantagens();
    
    // Buscar transações por vantagem ID
    List<Transacao> findByVantagemId(Long vantagemId);
    
    // Estatísticas - total de moedas enviadas por um professor
    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM Transacao t WHERE t.remetente = :professor AND t.tipoTransacao = 'ENVIO_MOEDA'")
    BigDecimal sumMoedasEnviadasPorProfessor(@Param("professor") Usuario professor);
    
    // Estatísticas - total de moedas recebidas por um aluno
    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM Transacao t WHERE t.destinatario = :aluno AND t.tipoTransacao = 'ENVIO_MOEDA'")
    BigDecimal sumMoedasRecebidasPorAluno(@Param("aluno") Usuario aluno);
    
    // Estatísticas - total de moedas gastas por um aluno
    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM Transacao t WHERE t.destinatario = :aluno AND t.tipoTransacao = 'RESGATE_VANTAGEM'")
    BigDecimal sumMoedasGastasPorAluno(@Param("aluno") Usuario aluno);
    
    // Estatísticas - total de resgates de uma vantagem
    @Query("SELECT COUNT(t) FROM Transacao t WHERE t.vantagem.id = :vantagemId")
    Long countResgatesPorVantagem(@Param("vantagemId") Long vantagemId);
    
    // Transações recentes (últimas 10)
    @Query("SELECT t FROM Transacao t ORDER BY t.dataTransacao DESC")
    List<Transacao> findTop10ByOrderByDataTransacaoDesc();
}