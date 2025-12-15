package com.lamalda.backend.controller;

import com.lamalda.backend.dto.CategoriaDTO;
import com.lamalda.backend.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public ResponseEntity<List<CategoriaDTO>> getCategorias() {
        return ResponseEntity.ok(categoriaService.listaCategorias());
    }

    @GetMapping("/main")
    public ResponseEntity<List<CategoriaDTO>> getCategoriasPadre() {
        return ResponseEntity.ok(categoriaService.listaCategoriasPadre());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaDTO> getCategoriaPorId(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.buscaCategoriaPorId(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<CategoriaDTO> getCategoriaPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(categoriaService.buscaCategoriaPorSlug(slug));
    }

    @GetMapping("/{id}/subcategories")
    public ResponseEntity<List<CategoriaDTO>> getSubcategorias(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.listaSubcategorias(id));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> contarCategorias() {
        return ResponseEntity.ok(categoriaService.contarCategorias());
    }

    @PostMapping
    public ResponseEntity<CategoriaDTO> crearCategoria(@Valid @RequestBody CategoriaDTO dto) {
        CategoriaDTO newCategory = categoriaService.crearCategoria(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newCategory);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaDTO> actualizarCategoria(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaDTO dto) {
        return ResponseEntity.ok(categoriaService.actualizarCategoria(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCategoria(@PathVariable Long id) {
        categoriaService.eliminarCategoria(id);
        return ResponseEntity.noContent().build();
    }
}
