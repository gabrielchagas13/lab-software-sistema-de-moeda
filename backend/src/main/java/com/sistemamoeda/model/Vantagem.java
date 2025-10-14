package com.sistemamoeda.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vantagem")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vantagem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    @NotNull(message = "Empresa é obrigatória")
    private Empresa empresa;
    
    @NotBlank(message = "Nome da vantagem é obrigatório")
    @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
    @Column(nullable = false, length = 150)
    private String nome;
    
    @NotBlank(message = "Descrição é obrigatória")
    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;
    
    @NotNull(message = "Custo em moedas é obrigatório")
    @DecimalMin(value = "0.01", message = "Custo deve ser maior que zero")
    @Column(name = "custo_moedas", nullable = false, precision = 10, scale = 2)
    private BigDecimal custoMoedas;
    
    @Size(max = 255, message = "URL da foto deve ter no máximo 255 caracteres")
    @Column(name = "foto_url", length = 255)
    private String fotoUrl;
    
    @Column(nullable = false)
    private Boolean ativa = true;
    
    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;
    
    // Construtor para criação
    public Vantagem(Empresa empresa, String nome, String descricao, BigDecimal custoMoedas, String fotoUrl) {
        this.empresa = empresa;
        this.nome = nome;
        this.descricao = descricao;
        this.custoMoedas = custoMoedas;
        this.fotoUrl = fotoUrl;
        this.ativa = true;
    }
    
    // Método de negócio
    public void ativar() {
        this.ativa = true;
    }
    
    public void desativar() {
        this.ativa = false;
    }
}