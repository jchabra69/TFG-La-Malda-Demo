package com.lamalda.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PedidoEstadoRequest {

    @NotBlank(message = "El estado es obligatorio")
    private String estado;
}
