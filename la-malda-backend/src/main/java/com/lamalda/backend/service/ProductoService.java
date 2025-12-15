package com.lamalda.backend.service;

import com.lamalda.backend.dto.ImagenProductoDTO;
import com.lamalda.backend.dto.ProductoDTO;
import com.lamalda.backend.dto.ProductoRequestDTO;
import com.lamalda.backend.dto.VarianteProductoDTO;
import com.lamalda.backend.exception.DuplicateResourceException;
import com.lamalda.backend.exception.ResourceNotFoundException;
import com.lamalda.backend.mapper.ProductoMapper;
import com.lamalda.backend.model.entity.Categoria;
import com.lamalda.backend.model.entity.ImagenProducto;
import com.lamalda.backend.model.entity.Producto;
import com.lamalda.backend.model.entity.ProductoVariante;
import com.lamalda.backend.repository.CategoriaRepository;
import com.lamalda.backend.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoMapper productoMapper;

    @Transactional(readOnly = true)
    public List<ProductoDTO> listarProductos() {
        return productoRepository.findAll().stream()
                .map(productoMapper::aProductoDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductoDTO getProductoPorId(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return productoMapper.aProductoDTO(producto);
    }

    @Transactional(readOnly = true)
    public ProductoDTO getProductoPorSlug(String slug) {
        Producto producto = productoRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return productoMapper.aProductoDTO(producto);
    }

    @Transactional(readOnly = true)
    public List<ProductoDTO> buscarPorCategoria(Long categoriaId) {
        return productoRepository.findByCategoriaId(categoriaId).stream()
                .map(productoMapper::aProductoDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductoDTO> buscarPorNombre(String termino) {
        return productoRepository.findByNombreContainingIgnoreCase(termino).stream()
                .map(productoMapper::aProductoDTO)
                .collect(Collectors.toList());
    }

    public ProductoDTO crearProducto(ProductoRequestDTO dto) {
        if (productoRepository.existsBySlug(dto.getSlug())) {
            throw new DuplicateResourceException("Product", "slug", dto.getSlug());
        }

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoriaId()));

        Producto producto = Producto.builder()
                .nombre(dto.getNombre())
                .slug(dto.getSlug())
                .descripcion(dto.getDescripcion())
                .precio(dto.getPrecio())
                .imagenUrl(dto.getImagenUrl())
                .destacado(Boolean.TRUE.equals(dto.getDestacado()))
                .categoria(categoria)
                .build();

        sincronizarVariantes(producto, dto.getVariantes());
        sincronizarImagenes(producto, dto.getImagenes());

        Producto saved = productoRepository.save(producto);
        return productoMapper.aProductoDTO(saved);
    }

    public ProductoDTO actualizarProducto(Long id, ProductoRequestDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (!producto.getSlug().equals(dto.getSlug()) && productoRepository.existsBySlug(dto.getSlug())) {
            throw new DuplicateResourceException("Product", "slug", dto.getSlug());
        }

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoriaId()));

        producto.setNombre(dto.getNombre());
        producto.setSlug(dto.getSlug());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setImagenUrl(dto.getImagenUrl());
        producto.setCategoria(categoria);
        producto.setDestacado(Boolean.TRUE.equals(dto.getDestacado()));

        if (dto.getVariantes() != null) {
            sincronizarVariantes(producto, dto.getVariantes());
        }
        if (dto.getImagenes() != null) {
            sincronizarImagenes(producto, dto.getImagenes());
        }

        Producto updated = productoRepository.save(producto);
        return productoMapper.aProductoDTO(updated);
    }

    public void eliminarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        productoRepository.delete(producto);
    }

    @Transactional(readOnly = true)
    public long contarProductos() {
        return productoRepository.count();
    }

    private void sincronizarVariantes(Producto producto, List<VarianteProductoDTO> variantes) {
        if (producto.getVariantes() == null) {
            producto.setVariantes(new ArrayList<>());
        } else {
            producto.getVariantes().clear();
        }
        if (variantes == null) {
            return;
        }
        List<ProductoVariante> nuevas = new ArrayList<>();
        for (VarianteProductoDTO dto : variantes) {
            ProductoVariante variante = ProductoVariante.builder()
                    .producto(producto)
                    .talla(dto.getTalla())
                    .color(dto.getColor())
                    .stock(dto.getStock() != null ? dto.getStock() : 0)
                    .build();
            nuevas.add(variante);
        }
        producto.getVariantes().addAll(nuevas);
    }

    private void sincronizarImagenes(Producto producto, List<ImagenProductoDTO> imagenes) {
        if (producto.getImagenes() == null) {
            producto.setImagenes(new ArrayList<>());
        } else {
            producto.getImagenes().clear();
        }
        if (imagenes == null) {
            return;
        }
        List<ImagenProducto> nuevas = new ArrayList<>();
        for (ImagenProductoDTO dto : imagenes) {
            ImagenProducto imagen = ImagenProducto.builder()
                    .producto(producto)
                    .url(dto.getUrl())
                    .esPrincipal(Boolean.TRUE.equals(dto.getEsPrincipal()))
                    .orden(dto.getOrden() != null ? dto.getOrden() : 0)
                    .build();
            nuevas.add(imagen);
        }
        producto.getImagenes().addAll(nuevas);
    }
}
