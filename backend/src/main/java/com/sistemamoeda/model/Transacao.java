package com.sistemamoeda.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transacao")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transacao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_transacao", nullable = false)
    @NotNull(message = "Tipo de transação é obrigatório")
    private TipoTransacao tipoTransacao;
    
    @NotNull(message = "Valor é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String descricao;
    
    @CreationTimestamp
    @Column(name = "data_transacao", nullable = false, updatable = false)
    private LocalDateTime dataTransacao;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "remetente_id")
    private Usuario remetente; // NULL para créditos semestrais
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destinatario_id")
    private Usuario destinatario; // NULL para resgates
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vantagem_id")
    private Vantagem vantagem; // preenchido apenas para resgates
    
    @Column(name = "codigo_cupom", length = 50)
    private String codigoCupom; // gerado para resgates
    
    // Construtor para envio de moedas
    public Transacao(TipoTransacao tipoTransacao, BigDecimal valor, String descricao, Usuario remetente, Usuario destinatario) {
        this.tipoTransacao = tipoTransacao;
        this.valor = valor;
        this.descricao = descricao;
        this.remetente = remetente;
        this.destinatario = destinatario;
    }
    
    // Construtor para resgate de vantagem
    public Transacao(TipoTransacao tipoTransacao, BigDecimal valor, String descricao, Usuario destinatario, Vantagem vantagem, String codigoCupom) {
        this.tipoTransacao = tipoTransacao;
        this.valor = valor;
        this.descricao = descricao;
        this.destinatario = destinatario;
        this.vantagem = vantagem;
        this.codigoCupom = codigoCupom;
    }
    
    // Construtor para crédito semestral
    public Transacao(TipoTransacao tipoTransacao, BigDecimal valor, String descricao, Usuario destinatario) {
        this.tipoTransacao = tipoTransacao;
        this.valor = valor;
        this.descricao = descricao;
        this.destinatario = destinatario;
    }
}