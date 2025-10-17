package com.sistemamoeda.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VantagemResponseDTO {
    
    private Long id;
    
    // Dados da empresa
    private Long empresaId;
    private String empresaNome;
    
    // Dados da vantagem
    private String nome;
    private String descricao;
    private BigDecimal custoMoedas;
    private String fotoUrl;
    private Boolean ativa;
    private LocalDateTime dataCriacao;
}