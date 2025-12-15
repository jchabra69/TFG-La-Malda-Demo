package com.lamalda.backend.controller;

import com.lamalda.backend.dto.UsuarioDTO;
import com.lamalda.backend.dto.login.AuthResponseDTO;
import com.lamalda.backend.dto.login.LoginRequestDTO;
import com.lamalda.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> iniciarSesion(
            @Valid @RequestBody LoginRequestDTO dto) {
        AuthResponseDTO response = authService.iniciarSesion(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> registrarUsuario(
            @Valid @RequestBody UsuarioDTO dto) {
        AuthResponseDTO response = authService.registrarUsuario(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }
}
