package com.lamalda.backend.controller;

import com.lamalda.backend.dto.CategoriaDTO;
import com.lamalda.backend.dto.ProductoDTO;
import com.lamalda.backend.dto.ProductoRequestDTO;
import com.lamalda.backend.dto.UsuarioDTO;
import com.lamalda.backend.service.CategoriaService;
import com.lamalda.backend.service.ProductoService;
import com.lamalda.backend.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {

    private final UsuarioService usuarioService;
    private final ProductoService productoService;
    private final CategoriaService categoriaService;
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getEstadisticas() {
        Map<String, Object> stats = Map.of(
                "totalUsuarios", usuarioService.contarUsuarios(),
                "usuariosActivos", usuarioService.contarUsuariosActivos(),
                "totalProductos", productoService.contarProductos(),
                "totalCategorias", categoriaService.contarCategorias()
        );
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UsuarioDTO>> getUsuariosAdmin() {
        return ResponseEntity.ok(usuarioService.getUsuarios());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UsuarioDTO> getUsuarioAdminPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.getUsuarioPorId(id));
    }

    @PostMapping("/users")
    public ResponseEntity<UsuarioDTO> crearUsuarioAdmin(
            @Valid @RequestBody UsuarioDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(usuarioService.crearUsuario(dto));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UsuarioDTO> actualizarUsuarioAdmin(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioDTO dto) {
        return ResponseEntity.ok(usuarioService.actualizarUsuario(id, dto));
    }

    @PutMapping("/users/{id}/toggle-active")
    public ResponseEntity<UsuarioDTO> ponerUsuarioActivo(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.alternarActivo(id));
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<Map<String, String>> restablecerPasswordUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        usuarioService.restablecerPassword(id, body.get("nuevaPassword"));
        return ResponseEntity.ok(Map.of("message", "Contraseña restablecuda"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductoDTO>> getProductosAdmin() {
        return ResponseEntity.ok(productoService.listarProductos());
    }

    @PostMapping("/products")
    public ResponseEntity<ProductoDTO> crearProductoAdmin(
            @Valid @RequestBody ProductoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productoService.crearProducto(dto));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductoDTO> actualizarProductoAdmin(
            @PathVariable Long id,
            @Valid @RequestBody ProductoRequestDTO dto) {
        return ResponseEntity.ok(productoService.actualizarProducto(id, dto));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> eliminarProductoAdmin(@PathVariable Long id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoriaDTO>> getCategoriasAdmin() {
        return ResponseEntity.ok(categoriaService.listaCategorias());
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoriaDTO> crearCategoriaAdmin(
            @Valid @RequestBody CategoriaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoriaService.crearCategoria(dto));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoriaDTO> actualizarCategoriaAdmin(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaDTO dto) {
        return ResponseEntity.ok(categoriaService.actualizarCategoria(id, dto));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> eliminarCategoriaAdmin(@PathVariable Long id) {
        categoriaService.eliminarCategoria(id);
        return ResponseEntity.noContent().build();
    }
}
