package com.lamalda.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductoDTO {

    private Long id;
    private String nombre;
    private String slug;
    private String descripcion;
    private BigDecimal precio;
    private Boolean destacado;
    private String imagenPrincipal;
    private Long categoriaId;
    @Builder.Default
    private List<VarianteProductoDTO> variantes = List.of();
    @Builder.Default
    private List<ImagenProductoDTO> imagenes = List.of();
}
