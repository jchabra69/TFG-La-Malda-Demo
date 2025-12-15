package com.lamalda.backend.controller;

import com.lamalda.backend.exception.BadRequestException;
import com.lamalda.backend.service.CarritoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CarritoController {

    private final CarritoService carritoService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCarrito(
            Authentication authentication,
            @RequestParam(required = false) String sessionId) {

        String email = authentication != null ? authentication.getName() : null;

        Map<String, Object> carrito = carritoService.getCarrito(email, sessionId);
        return ResponseEntity.ok(carrito);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> agregarAlCarrito(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        String email = authentication != null ? authentication.getName() : null;
        Long productoId = extraerLong(request, "productoId");
        Integer cantidad = extraerEntero(request, "cantidad");
        String sessionId = request.get("idSesion") != null ? request.get("idSesion").toString() : null;

        Map<String, Object> prod = carritoService.meterAlCarrito(productoId, cantidad, email, sessionId);
        return ResponseEntity.status(HttpStatus.CREATED).body(prod);
    }

    @PutMapping("/{cartId}")
    public ResponseEntity<Map<String, Object>> actualizarCantidad(
            @PathVariable Long cartId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        String email = authentication != null ? authentication.getName() : null;
        Integer cantidad = extraerEntero(request, "cantidad");

        Map<String, Object> carrito = carritoService.actualizarCantidad(cartId, cantidad, email);
        return ResponseEntity.ok(carrito);
    }

    @DeleteMapping("/{cartId}")
    public ResponseEntity<Void> eliminarDelCarrito(
            @PathVariable Long cartId,
            Authentication authentication) {

        String email = authentication != null ? authentication.getName() : null;

        carritoService.eliminarDelCarrito(cartId, email);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> vaciarCarrito(
            Authentication authentication,
            @RequestParam(required = false) String sessionId) {

        String email = authentication != null ? authentication.getName() : null;

        carritoService.vaciarCarrito(email, sessionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/transfer")
    public ResponseEntity<Void> transferirCarrito(
            @RequestParam String sessionId,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();

        carritoService.transferirCarrito(sessionId, email);
        return ResponseEntity.ok().build();
    }

    private Long extraerLong(Map<String, Object> body, String clave) {
        Object valor = body.get(clave);
        if (valor instanceof Number numero) {
            return numero.longValue();
        }
        if (valor != null) {
            return Long.parseLong(valor.toString());
        }
        throw new BadRequestException("Falta el campo " + clave);
    }

    private Integer extraerEntero(Map<String, Object> body, String clave) {
        Object valor = body.get(clave);
        if (valor == null) {
            return null;
        }
        if (valor instanceof Number numero) {
            return numero.intValue();
        }
        return Integer.parseInt(valor.toString());
    }
}
