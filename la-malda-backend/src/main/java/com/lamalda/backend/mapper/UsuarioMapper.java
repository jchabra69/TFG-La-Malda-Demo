package com.lamalda.backend.mapper;

import com.lamalda.backend.dto.UsuarioDTO;
import com.lamalda.backend.model.entity.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public UsuarioDTO aUsuarioDTO(Usuario usuario) {
        if (usuario == null) {
            return null;
        }

        return UsuarioDTO.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellidos(usuario.getApellidos())
                .telefono(usuario.getTelefono())
                .rol(usuario.getRol())
                .activo(usuario.getEstaActivo())
                .build();
    }

    public Usuario aEntidad(UsuarioDTO dto) {
        if (dto == null) {
            return null;
        }

        return Usuario.builder()
                .email(dto.getEmail())
                .nombre(dto.getNombre())
                .apellidos(dto.getApellidos())
                .telefono(dto.getTelefono())
                .rol(dto.getRol() != null ? dto.getRol().toUpperCase() : null)
                .estaActivo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();
    }

    public void actualizarEntidadDesdeDTO(UsuarioDTO dto, Usuario usuario) {
        if (dto == null || usuario == null) {
            return;
        }

        if (dto.getEmail() != null) {
            usuario.setEmail(dto.getEmail());
        }
        if (dto.getNombre() != null) {
            usuario.setNombre(dto.getNombre());
        }
        if (dto.getApellidos() != null) {
            usuario.setApellidos(dto.getApellidos());
        }
        if (dto.getTelefono() != null) {
            usuario.setTelefono(dto.getTelefono());
        }
        if (dto.getRol() != null) {
            usuario.setRol(dto.getRol().toUpperCase());
        }
        if (dto.getActivo() != null) {
            usuario.setEstaActivo(dto.getActivo());
        }
    }
}
