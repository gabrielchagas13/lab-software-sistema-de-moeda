package com.sistemamoeda.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "aluno")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Aluno {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;
    
    @NotBlank(message = "Instituição é obrigatória")
    @Size(max = 100, message = "Instituição deve ter no máximo 100 caracteres")
    @Column(nullable = false, length = 100)
    private String instituicao;
    
    @NotBlank(message = "CPF é obrigatório")
    @Pattern(regexp = "\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}", message = "CPF deve estar no formato XXX.XXX.XXX-XX")
    @Column(nullable = false, unique = true, length = 14)
    private String cpf;
    
    @NotBlank(message = "RG é obrigatório")
    @Size(max = 15, message = "RG deve ter no máximo 15 caracteres")
    @Column(nullable = false, length = 15)
    private String rg;
    
    @NotBlank(message = "Endereço é obrigatório")
    @Size(max = 255, message = "Endereço deve ter no máximo 255 caracteres")
    @Column(nullable = false, length = 255)
    private String endereco;
    
    @NotBlank(message = "Curso é obrigatório")
    @Size(max = 100, message = "Curso deve ter no máximo 100 caracteres")
    @Column(nullable = false, length = 100)
    private String curso;
    
    @Column(name = "saldo_moedas", nullable = false, precision = 10, scale = 2)
    private BigDecimal saldoMoedas = BigDecimal.ZERO;
    
    @CreationTimestamp
    @Column(name = "data_cadastro", nullable = false, updatable = false)
    private LocalDateTime dataCadastro;
    
    // Construtor para criação
    public Aluno(Usuario usuario, String instituicao, String cpf, String rg, String endereco, String curso) {
        this.usuario = usuario;
        this.instituicao = instituicao;
        this.cpf = cpf;
        this.rg = rg;
        this.endereco = endereco;
        this.curso = curso;
        this.saldoMoedas = BigDecimal.ZERO;
    }
    
    // Métodos de negócio
    public void adicionarMoedas(BigDecimal valor) {
        if (valor.compareTo(BigDecimal.ZERO) > 0) {
            this.saldoMoedas = this.saldoMoedas.add(valor);
        }
    }
    
    public boolean podeGastar(BigDecimal valor) {
        return this.saldoMoedas.compareTo(valor) >= 0;
    }
    
    public void gastarMoedas(BigDecimal valor) {
        if (podeGastar(valor)) {
            this.saldoMoedas = this.saldoMoedas.subtract(valor);
        } else {
            throw new IllegalArgumentException("Saldo insuficiente");
        }
    }
}