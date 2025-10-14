package com.sistemamoeda.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "instituicao")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Instituicao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Nome da instituição é obrigatório")
    @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
    @Column(nullable = false, length = 150)
    private String nome;
    
    @Size(max = 255, message = "Endereço deve ter no máximo 255 caracteres")
    @Column(length = 255)
    private String endereco;
    
    @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
    @Column(length = 20)
    private String telefone;
    
    @Size(max = 150, message = "Email deve ter no máximo 150 caracteres")
    @Column(length = 150)
    private String email;
    
    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;
    
    @Column(nullable = false)
    private Boolean ativo = true;
    
    // Construtor para criação
    public Instituicao(String nome, String endereco, String telefone, String email) {
        this.nome = nome;
        this.endereco = endereco;
        this.telefone = telefone;
        this.email = email;
        this.ativo = true;
    }
}