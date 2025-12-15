package com.lamalda.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaDTO {

    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String nombre;

    @NotBlank(message = "El slug es obligatorio")
    @Size(min = 2, max = 120, message = "El slug debe tener entre 2 y 120 caracteres")
    private String slug;

    private Long idCategoriaPadre;
    private String nombreCategoriaPadre;

    @Builder.Default
    private List<CategoriaDTO> subcategorias = List.of();

    @Builder.Default
    private Long totalProductos = 0L;
}
