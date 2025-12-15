package com.lamalda.backend.service;

import com.lamalda.backend.dto.UsuarioDTO;
import com.lamalda.backend.exception.BadRequestException;
import com.lamalda.backend.exception.DuplicateResourceException;
import com.lamalda.backend.exception.ResourceNotFoundException;
import com.lamalda.backend.mapper.UsuarioMapper;
import com.lamalda.backend.model.entity.Usuario;
import com.lamalda.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UsuarioDTO> getUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(usuarioMapper::aUsuarioDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioDTO getUsuarioPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return usuarioMapper.aUsuarioDTO(usuario);
    }

    public UsuarioDTO crearUsuario(UsuarioDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("User", "email", dto.getEmail());
        }
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new BadRequestException("La contraseña es obligatoria");
        }

        Usuario usuario = usuarioMapper.aEntidad(dto);
        usuario.setHashContrasena(passwordEncoder.encode(dto.getPassword()));

        Usuario saved = usuarioRepository.save(usuario);
        return usuarioMapper.aUsuarioDTO(saved);
    }

    public UsuarioDTO actualizarUsuario(Long id, UsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (dto.getEmail() != null && !dto.getEmail().equals(usuario.getEmail())
                && usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("User", "email", dto.getEmail());
        }

        usuarioMapper.actualizarEntidadDesdeDTO(dto, usuario);
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            usuario.setHashContrasena(passwordEncoder.encode(dto.getPassword()));
        }

        Usuario updated = usuarioRepository.save(usuario);
        return usuarioMapper.aUsuarioDTO(updated);
    }

    public UsuarioDTO alternarActivo(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        usuario.setEstaActivo(Boolean.FALSE.equals(usuario.getEstaActivo()));
        return usuarioMapper.aUsuarioDTO(usuarioRepository.save(usuario));
    }

    public void restablecerPassword(Long id, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        if (nuevaPassword == null || nuevaPassword.isBlank()) {
            throw new BadRequestException("La nueva contraseña es obligatoria");
        }
        usuario.setHashContrasena(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        usuarioRepository.delete(usuario);
    }

    @Transactional(readOnly = true)
    public long contarUsuarios() {
        return usuarioRepository.count();
    }

    @Transactional(readOnly = true)
    public long contarUsuariosActivos() {
        return usuarioRepository.countByEstaActivoTrue();
    }
}
