package com.lamalda.backend.mapper;

import com.lamalda.backend.dto.ImagenProductoDTO;
import com.lamalda.backend.dto.ProductoDTO;
import com.lamalda.backend.dto.VarianteProductoDTO;
import com.lamalda.backend.model.entity.ImagenProducto;
import com.lamalda.backend.model.entity.Producto;
import com.lamalda.backend.model.entity.ProductoVariante;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductoMapper {

    public ProductoDTO aProductoDTO(Producto producto) {
        if (producto == null) {
            return null;
        }

        return ProductoDTO.builder()
                .id(producto.getId())
                .nombre(producto.getNombre())
                .slug(producto.getSlug())
                .descripcion(producto.getDescripcion())
                .precio(producto.getPrecio())
                .destacado(producto.getDestacado())
                .imagenPrincipal(producto.getImagenUrl())
                .categoriaId(producto.getCategoria() != null ? producto.getCategoria().getId() : null)
                .variantes(mapearVariantes(producto.getVariantes()))
                .imagenes(mapearImagenes(producto.getImagenes()))
                .build();
    }

    private List<VarianteProductoDTO> mapearVariantes(List<ProductoVariante> variantes) {
        if (variantes == null) {
            return Collections.emptyList();
        }
        return variantes.stream()
                .map(variante -> VarianteProductoDTO.builder()
                        .id(variante.getId())
                        .productoId(variante.getProducto().getId())
                        .talla(variante.getTalla())
                        .color(variante.getColor())
                        .stock(variante.getStock())
                        .build())
                .collect(Collectors.toList());
    }

    private List<ImagenProductoDTO> mapearImagenes(List<ImagenProducto> imagenes) {
        if (imagenes == null) {
            return Collections.emptyList();
        }
        return imagenes.stream()
                .map(img -> ImagenProductoDTO.builder()
                        .id(img.getId())
                        .productoId(img.getProducto().getId())
                        .url(img.getUrl())
                        .esPrincipal(img.getEsPrincipal())
                        .orden(img.getOrden())
                        .build())
                .collect(Collectors.toList());
    }
}
