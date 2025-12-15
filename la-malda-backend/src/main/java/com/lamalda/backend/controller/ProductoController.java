package com.lamalda.backend.controller;

import com.lamalda.backend.dto.ProductoDTO;
import com.lamalda.backend.dto.ProductoRequestDTO;
import com.lamalda.backend.service.ProductoService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<ProductoDTO>> listarProductos() {
        return ResponseEntity.ok(productoService.listarProductos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> getProductoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.getProductoPorId(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductoDTO> getProductoPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(productoService.getProductoPorSlug(slug));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductoDTO>> buscarPorCategoria(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productoService.buscarPorCategoria(categoryId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductoDTO>> buscarProductos(@RequestParam("q") String termino) {
        return ResponseEntity.ok(productoService.buscarPorNombre(termino));
    }

    @PostMapping
    public ResponseEntity<ProductoDTO> crearProducto(@Valid @RequestBody ProductoRequestDTO dto) {
        ProductoDTO nuevoProducto = productoService.crearProducto(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> actualizarProducto(
            @PathVariable Long id,
            @Valid @RequestBody ProductoRequestDTO dto) {
        return ResponseEntity.ok(productoService.actualizarProducto(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> contarProductos() {
        return ResponseEntity.ok(productoService.contarProductos());
    }
}
