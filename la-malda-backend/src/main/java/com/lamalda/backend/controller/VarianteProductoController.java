package com.lamalda.backend.controller;

import com.lamalda.backend.dto.VarianteProductoDTO;
import com.lamalda.backend.service.VarianteProductoService;
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
@RequestMapping("/api/variants")
@RequiredArgsConstructor
public class VarianteProductoController {

    private final VarianteProductoService varianteProductoService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<VarianteProductoDTO>> listarPorProducto(@PathVariable Long productId) {
        return ResponseEntity.ok(varianteProductoService.listarPorProducto(productId));
    }

    @PostMapping
    public ResponseEntity<VarianteProductoDTO> crearVariante(
            @Valid @RequestBody VarianteProductoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(varianteProductoService.crearVariante(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VarianteProductoDTO> actualizarVariante(
            @PathVariable Long id,
            @Valid @RequestBody VarianteProductoDTO dto) {
        return ResponseEntity.ok(varianteProductoService.actualizarVariante(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarVariante(@PathVariable Long id) {
        varianteProductoService.eliminarVariante(id);
        return ResponseEntity.noContent().build();
    }
}
