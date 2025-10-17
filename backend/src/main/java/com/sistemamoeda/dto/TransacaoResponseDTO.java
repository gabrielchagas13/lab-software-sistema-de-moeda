package com.sistemamoeda.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransacaoResponseDTO {
    
    private Long id;
    private String tipoTransacao;
    private BigDecimal valor;
    private String descricao;
    private LocalDateTime dataTransacao;
    private String codigoCupom;
    
    // Dados do remetente
    private Long remetenteId;
    private String remetenteNome;
    
    // Dados do destinatário
    private Long destinatarioId;
    private String destinatarioNome;
    
    // Dados da vantagem (se aplicável)
    private Long vantagemId;
    private String vantagemNome;
    private String empresaNome;
}