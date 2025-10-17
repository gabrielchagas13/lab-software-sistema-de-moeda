package com.sistemamoeda.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessorResponseDTO {
    
    private Long id;
    
    // Dados do usuário
    private Long usuarioId;
    private String nome;
    private String email;
    private String tipoUsuario;
    private LocalDateTime dataCriacao;
    private Boolean ativo;
    
    // Dados específicos do professor
    private Long instituicaoId;
    private String instituicaoNome;
    private String cpf;
    private String departamento;
    private BigDecimal saldoMoedas;
    private LocalDateTime dataCadastro;
}