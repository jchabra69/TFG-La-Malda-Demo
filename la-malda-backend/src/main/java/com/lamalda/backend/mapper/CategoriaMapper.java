package com.lamalda.backend.mapper;

import com.lamalda.backend.dto.CategoriaDTO;
import com.lamalda.backend.model.entity.Categoria;
import org.springframework.stereotype.Component;

@Component
public class CategoriaMapper {

    public CategoriaDTO aCategoriaDTO(Categoria categoria) {
        if (categoria == null) {
            return null;
        }

        CategoriaDTO dto = CategoriaDTO.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .slug(categoria.getSlug())
                .idCategoriaPadre(categoria.getCategoriaPadre() != null ? categoria.getCategoriaPadre().getId() : null)
                .nombreCategoriaPadre(categoria.getCategoriaPadre() != null ? categoria.getCategoriaPadre().getNombre() : null)
                .totalProductos(0L)
                .build();

        if (categoria.getSubcategories() != null && !categoria.getSubcategories().isEmpty()) {
            dto.setSubcategorias(categoria.getSubcategories().stream()
                    .map(this::aCategoriaDTO)
                    .toList());
        }

        return dto;
    }

    public Categoria aEntidad(CategoriaDTO dto) {
        if (dto == null) {
            return null;
        }

        return Categoria.builder()
                .nombre(dto.getNombre())
                .slug(dto.getSlug())
                .build();
    }

    public void actualizarEntidadDesdeDTO(CategoriaDTO dto, Categoria categoria) {
        if (dto == null || categoria == null) {
            return;
        }

        if (dto.getNombre() != null) {
            categoria.setNombre(dto.getNombre());
        }
        if (dto.getSlug() != null) {
            categoria.setSlug(dto.getSlug());
        }
    }
}
