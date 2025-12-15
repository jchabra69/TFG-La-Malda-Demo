package com.lamalda.backend.service;

import com.lamalda.backend.dto.VarianteProductoDTO;
import com.lamalda.backend.exception.ResourceNotFoundException;
import com.lamalda.backend.model.entity.Producto;
import com.lamalda.backend.model.entity.ProductoVariante;
import com.lamalda.backend.repository.ProductoRepository;
import com.lamalda.backend.repository.ProductoVarianteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VarianteProductoService {

    private final ProductoVarianteRepository varianteRepository;
    private final ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public List<VarianteProductoDTO> listarPorProducto(Long productoId) {
        return varianteRepository.findByProductoId(productoId).stream()
                .map(this::aDTO)
                .collect(Collectors.toList());
    }

    public VarianteProductoDTO crearVariante(VarianteProductoDTO dto) {
        Producto producto = obtenerProducto(dto.getProductoId());

        ProductoVariante variante = ProductoVariante.builder()
                .producto(producto)
                .talla(dto.getTalla())
                .color(dto.getColor())
                .stock(dto.getStock())
                .build();

        ProductoVariante guardada = varianteRepository.save(variante);
        return aDTO(guardada);
    }

    public VarianteProductoDTO actualizarVariante(Long id, VarianteProductoDTO dto) {
        ProductoVariante variante = varianteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Variant", "id", id));

        if (dto.getProductoId() != null && !dto.getProductoId().equals(variante.getProducto().getId())) {
            Producto producto = obtenerProducto(dto.getProductoId());
            variante.setProducto(producto);
        }
        if (dto.getTalla() != null) {
            variante.setTalla(dto.getTalla());
        }
        if (dto.getColor() != null) {
            variante.setColor(dto.getColor());
        }
        if (dto.getStock() != null) {
            variante.setStock(dto.getStock());
        }

        ProductoVariante actualizada = varianteRepository.save(variante);
        return aDTO(actualizada);
    }

    public void eliminarVariante(Long id) {
        ProductoVariante variante = varianteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Variant", "id", id));
        varianteRepository.delete(variante);
    }

    private VarianteProductoDTO aDTO(ProductoVariante variante) {
        return VarianteProductoDTO.builder()
                .id(variante.getId())
                .productoId(variante.getProducto().getId())
                .talla(variante.getTalla())
                .color(variante.getColor())
                .stock(variante.getStock())
                .build();
    }

    private Producto obtenerProducto(Long productoId) {
        return productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productoId));
    }
}
