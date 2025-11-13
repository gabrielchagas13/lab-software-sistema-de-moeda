package com.sistemamoeda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransferirVantagemRequestDTO {

    @NotNull(message = "Remetente é obrigatório")
    private Long remetenteId;

    @NotNull(message = "Destinatário é obrigatório")
    private Long destinatarioId;

    @NotBlank(message = "Código do cupom é obrigatório")
    private String codigoCupom;
}
