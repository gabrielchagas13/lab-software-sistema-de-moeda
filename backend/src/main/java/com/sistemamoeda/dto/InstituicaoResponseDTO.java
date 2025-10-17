package com.sistemamoeda.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstituicaoResponseDTO {
    
    private Long id;
    private String nome;
    private String endereco;
    private String telefone;
    private String email;
    private LocalDateTime dataCriacao;
    private Boolean ativo;
}