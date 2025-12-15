package com.lamalda.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VarianteProductoDTO {

    private Long id;

    @NotNull(message = "El producto es obligatorio")
    private Long productoId;

    @NotBlank(message = "La talla es obligatoria")
    private String talla;

    @NotBlank(message = "El color es obligatorio")
    private String color;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;
}
