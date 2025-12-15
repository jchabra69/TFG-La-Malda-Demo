package com.lamalda.backend.service;

import com.lamalda.backend.dto.CategoriaDTO;
import com.lamalda.backend.exception.BadRequestException;
import com.lamalda.backend.exception.DuplicateResourceException;
import com.lamalda.backend.exception.ResourceNotFoundException;
import com.lamalda.backend.mapper.CategoriaMapper;
import com.lamalda.backend.model.entity.Categoria;
import com.lamalda.backend.repository.CategoriaRepository;
import com.lamalda.backend.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final CategoriaMapper categoriaMapper;
    private final ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public List<CategoriaDTO> listaCategorias() {
        List<CategoriaDTO> categorias = categoriaRepository.findAll()
                .stream()
                .map(categoriaMapper::aCategoriaDTO)
                .collect(Collectors.toList());
        return asignarTotales(categorias);
    }

    @Transactional(readOnly = true)
    public List<CategoriaDTO> listaCategoriasPadre() {
        List<CategoriaDTO> categorias = categoriaRepository.findByCategoriaPadreIsNullOrderByNombreAsc()
                .stream()
                .map(categoriaMapper::aCategoriaDTO)
                .collect(Collectors.toList());
        return asignarTotales(categorias);
    }

    @Transactional(readOnly = true)
    public CategoriaDTO buscaCategoriaPorId(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return asignarTotales(categoriaMapper.aCategoriaDTO(categoria));
    }

    @Transactional(readOnly = true)
    public CategoriaDTO buscaCategoriaPorSlug(String slug) {
        Categoria categoria = categoriaRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
        return asignarTotales(categoriaMapper.aCategoriaDTO(categoria));
    }

    @Transactional(readOnly = true)
    public List<CategoriaDTO> listaSubcategorias(Long parentId) {
        List<CategoriaDTO> categorias = categoriaRepository.findByCategoriaPadreIdOrderByNombreAsc(parentId)
                .stream()
                .map(categoriaMapper::aCategoriaDTO)
                .collect(Collectors.toList());
        return asignarTotales(categorias);
    }

    public CategoriaDTO crearCategoria(CategoriaDTO dto) {
        if (dto.getSlug() != null && categoriaRepository.findBySlug(dto.getSlug()).isPresent()) {
            throw new DuplicateResourceException("Category", "slug", dto.getSlug());
        }

        Categoria categoria = categoriaMapper.aEntidad(dto);
        asignarCategoriaPadre(dto.getIdCategoriaPadre(), categoria);

        Categoria saved = categoriaRepository.save(categoria);
        return asignarTotales(categoriaMapper.aCategoriaDTO(saved));
    }

    public CategoriaDTO actualizarCategoria(Long id, CategoriaDTO dto) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (dto.getSlug() != null && !dto.getSlug().equals(categoria.getSlug())) {
            categoriaRepository.findBySlug(dto.getSlug())
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new DuplicateResourceException("Category", "slug", dto.getSlug());
                    });
        }

        categoriaMapper.actualizarEntidadDesdeDTO(dto, categoria);

        if (dto.getIdCategoriaPadre() != null) {
            asignarCategoriaPadre(dto.getIdCategoriaPadre(), categoria);
        }

        Categoria updated = categoriaRepository.save(categoria);
        return asignarTotales(categoriaMapper.aCategoriaDTO(updated));
    }

    public void eliminarCategoria(Long categoryId) {
        Categoria categoria = categoriaRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        if (!categoriaRepository.findByCategoriaPadreIdOrderByNombreAsc(categoryId).isEmpty()) {
            throw new BadRequestException("No se pueden eliminar categorías con subcategorías");
        }

        categoriaRepository.delete(categoria);
    }

    @Transactional(readOnly = true)
    public long contarCategorias() {
        return categoriaRepository.count();
    }

    private void asignarCategoriaPadre(Long parentId, Categoria categoria) {
        if (parentId == null || parentId == 0L) {
            categoria.setCategoriaPadre(null);
            return;
        }
        if (categoria.getId() != null && parentId.equals(categoria.getId())) {
            throw new BadRequestException("Una categoría no puede ser su propia padre");
        }
        Categoria padre = categoriaRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", parentId));
        categoria.setCategoriaPadre(padre);
    }

    private List<CategoriaDTO> asignarTotales(List<CategoriaDTO> categorias) {
        if (categorias == null || categorias.isEmpty()) {
            return categorias;
        }
        Map<Long, Long> totales = obtenerTotalesProductos();
        categorias.forEach(cat -> aplicarTotales(cat, totales));
        return categorias;
    }

    private CategoriaDTO asignarTotales(CategoriaDTO categoria) {
        if (categoria == null) {
            return null;
        }
        Map<Long, Long> totales = obtenerTotalesProductos();
        aplicarTotales(categoria, totales);
        return categoria;
    }

    private void aplicarTotales(CategoriaDTO categoria, Map<Long, Long> totales) {
        if (categoria == null) {
            return;
        }
        long propios = totales.getOrDefault(categoria.getId(), 0L);
        long hijos = 0L;
        if (categoria.getSubcategorias() != null && !categoria.getSubcategorias().isEmpty()) {
            for (CategoriaDTO sub : categoria.getSubcategorias()) {
                aplicarTotales(sub, totales);
                hijos += sub.getTotalProductos() != null ? sub.getTotalProductos() : 0L;
            }
        }
        categoria.setTotalProductos(propios + hijos);
    }

    private Map<Long, Long> obtenerTotalesProductos() {
        return productoRepository.contarProductosPorCategoria().stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((Number) row[1]).longValue()
                ));
    }
}
