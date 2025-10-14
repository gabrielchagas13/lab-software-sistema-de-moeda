package com.sistemamoeda.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "empresa")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Empresa {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;
    
    @NotBlank(message = "Nome fantasia é obrigatório")
    @Size(max = 150, message = "Nome fantasia deve ter no máximo 150 caracteres")
    @Column(name = "nome_fantasia", nullable = false, length = 150)
    private String nomeFantasia;
    
    @NotBlank(message = "CNPJ é obrigatório")
    @Pattern(regexp = "\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}", message = "CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX")
    @Column(nullable = false, unique = true, length = 18)
    private String cnpj;
    
    @NotBlank(message = "Endereço é obrigatório")
    @Size(max = 255, message = "Endereço deve ter no máximo 255 caracteres")
    @Column(nullable = false, length = 255)
    private String endereco;
    
    @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
    @Column(length = 20)
    private String telefone;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String descricao;
    
    @CreationTimestamp
    @Column(name = "data_cadastro", nullable = false, updatable = false)
    private LocalDateTime dataCadastro;
    
    // Relacionamentos
    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Vantagem> vantagens;
    
    // Construtor para criação
    public Empresa(Usuario usuario, String nomeFantasia, String cnpj, String endereco, String telefone, String descricao) {
        this.usuario = usuario;
        this.nomeFantasia = nomeFantasia;
        this.cnpj = cnpj;
        this.endereco = endereco;
        this.telefone = telefone;
        this.descricao = descricao;
    }
}