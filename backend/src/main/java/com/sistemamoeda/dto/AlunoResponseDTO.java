package com.sistemamoeda.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlunoResponseDTO {
    
    private Long id;
    
    // Dados do usuário
    private Long usuarioId;
    private String nome;
    private String email;
    private String tipoUsuario;
    private LocalDateTime dataCriacao;
    private Boolean ativo;
    
    // Dados específicos do aluno
    private String instituicao;
    private String cpf;
    private String rg;
    private String endereco;
    private String curso;
    private BigDecimal saldoMoedas;
    private LocalDateTime dataCadastro;
}