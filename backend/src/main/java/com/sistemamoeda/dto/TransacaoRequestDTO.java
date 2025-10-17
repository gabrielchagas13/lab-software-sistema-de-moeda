package com.sistemamoeda.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransacaoRequestDTO {
    
    @NotNull(message = "ID do remetente é obrigatório")
    private Long remetenteId;
    
    @NotNull(message = "ID do destinatário é obrigatório")
    private Long destinatarioId;
    
    @NotNull(message = "Valor é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero")
    private BigDecimal valor;
    
    @NotBlank(message = "Descrição/motivo é obrigatório")
    private String descricao;
}