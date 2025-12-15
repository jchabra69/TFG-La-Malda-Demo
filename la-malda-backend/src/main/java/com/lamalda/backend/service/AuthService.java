package com.lamalda.backend.service;

import com.lamalda.backend.dto.UsuarioDTO;
import com.lamalda.backend.dto.login.AuthResponseDTO;
import com.lamalda.backend.dto.login.LoginRequestDTO;
import com.lamalda.backend.exception.BadRequestException;
import com.lamalda.backend.exception.DuplicateResourceException;
import com.lamalda.backend.exception.ResourceNotFoundException;
import com.lamalda.backend.model.entity.Usuario;
import com.lamalda.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UsuarioSeguridadService userDetailsService;

    public AuthResponseDTO iniciarSesion(LoginRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", dto.getEmail()));

        if (!usuario.getEstaActivo()) {
            throw new BadRequestException("La cuenta está desactivada");
        }

        if (!passwordEncoder.matches(dto.getPassword(), usuario.getHashContrasena())) {
            throw new BadRequestException("Correo electrónico o contraseña incorrectos");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getEmail());
        String jwtToken = jwtService.generarTokenConRol(userDetails, usuario.getRol());

        return AuthResponseDTO.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellidos(usuario.getApellidos())
                .telefono(usuario.getTelefono())
                .rol(usuario.getRol())
                .activo(usuario.getEstaActivo())
                .token(jwtToken)
                .mensaje("Inicio de sesión correcto")
                .build();
    }

    public AuthResponseDTO registrarUsuario(UsuarioDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("User", "email", dto.getEmail());
        }

        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new BadRequestException("La contraseña es obligatoria");
        }

        Usuario usuario = Usuario.builder()
                .email(dto.getEmail())
                .hashContrasena(passwordEncoder.encode(dto.getPassword()))
                .nombre(dto.getNombre())
                .apellidos(dto.getApellidos())
                .telefono(dto.getTelefono())
                .rol(dto.getRol() != null ? dto.getRol().toUpperCase() : "CLIENTE")
                .estaActivo(dto.getActivo() == null || dto.getActivo())
                .build();

        Usuario saved = usuarioRepository.save(usuario);

        UserDetails userDetails = userDetailsService.loadUserByUsername(saved.getEmail());
        String jwtToken = jwtService.generarTokenConRol(userDetails, saved.getRol());

        return AuthResponseDTO.builder()
                .id(saved.getId())
                .email(saved.getEmail())
                .nombre(saved.getNombre())
                .apellidos(saved.getApellidos())
                .telefono(saved.getTelefono())
                .rol(saved.getRol())
                .activo(saved.getEstaActivo())
                .token(jwtToken)
                .mensaje("Registro completado correctamente")
                .build();
    }
}
