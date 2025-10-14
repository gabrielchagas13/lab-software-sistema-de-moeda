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
@Table(name = "professor")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Professor {
    
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
    
    @NotBlank(message = "Departamento é obrigatório")
    @Size(max = 100, message = "Departamento deve ter no máximo 100 caracteres")
    @Column(nullable = false, length = 100)
    private String departamento;
    
    @Column(name = "saldo_moedas", nullable = false, precision = 10, scale = 2)
    private BigDecimal saldoMoedas = new BigDecimal("1000.00");
    
    @CreationTimestamp
    @Column(name = "data_cadastro", nullable = false, updatable = false)
    private LocalDateTime dataCadastro;
    
    // Construtor para criação
    public Professor(Usuario usuario, String instituicao, String cpf, String departamento) {
        this.usuario = usuario;
        this.instituicao = instituicao;
        this.cpf = cpf;
        this.departamento = departamento;
        this.saldoMoedas = new BigDecimal("1000.00");
    }
    
    // Métodos de negócio
    public void adicionarMoedasSemestrais() {
        this.saldoMoedas = this.saldoMoedas.add(new BigDecimal("1000.00"));
    }
    
    public boolean podeEnviar(BigDecimal valor) {
        return this.saldoMoedas.compareTo(valor) >= 0;
    }
    
    public void enviarMoedas(BigDecimal valor) {
        if (podeEnviar(valor)) {
            this.saldoMoedas = this.saldoMoedas.subtract(valor);
        } else {
            throw new IllegalArgumentException("Saldo insuficiente");
        }
    }
}