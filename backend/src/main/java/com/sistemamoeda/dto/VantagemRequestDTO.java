package com.sistemamoeda.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VantagemRequestDTO {
    
    @NotNull(message = "ID da empresa é obrigatório")
    private Long empresaId;
    
    @NotBlank(message = "Nome da vantagem é obrigatório")
    @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
    private String nome;
    
    @NotBlank(message = "Descrição é obrigatória")
    private String descricao;
    
    @NotNull(message = "Custo em moedas é obrigatório")
    @DecimalMin(value = "0.01", message = "Custo deve ser maior que zero")
    private BigDecimal custoMoedas;
    
    @Size(max = 255, message = "URL da foto deve ter no máximo 255 caracteres")
    private String fotoUrl;
}