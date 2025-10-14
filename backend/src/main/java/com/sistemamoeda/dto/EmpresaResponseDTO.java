package com.sistemamoeda.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpresaResponseDTO {
    
    private Long id;
    
    // Dados do usuário
    private Long usuarioId;
    private String nome;
    private String email;
    private String tipoUsuario;
    private LocalDateTime dataCriacao;
    private Boolean ativo;
    
    // Dados específicos da empresa
    private String nomeFantasia;
    private String cnpj;
    private String endereco;
    private String telefone;
    private String descricao;
    private LocalDateTime dataCadastro;
    private Long quantidadeVantagens;
}