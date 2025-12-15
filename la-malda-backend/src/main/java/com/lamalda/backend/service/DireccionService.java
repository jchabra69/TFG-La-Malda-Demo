package com.lamalda.backend.service;

import com.lamalda.backend.exception.ResourceNotFoundException;
import com.lamalda.backend.model.entity.Direccion;
import com.lamalda.backend.model.entity.Usuario;
import com.lamalda.backend.repository.DireccionRepository;
import com.lamalda.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DireccionService {

    private final DireccionRepository direccionRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<Direccion> getDireccionesPorUsuario(String email) {
        Usuario usuario = buscarUsuario(email);
        return direccionRepository.findByUsuarioOrderByIdDesc(usuario);
    }

    @Transactional(readOnly = true)
    public Direccion getDireccionPorId(Long id, String email) {
        Usuario usuario = buscarUsuario(email);
        return direccionRepository.findByIdAndUsuario(id, usuario)
                .orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada"));
    }

    @Transactional
    public Direccion crearDireccion(Direccion direccion, String email) {
        Usuario usuario = buscarUsuario(email);
        direccion.setUsuario(usuario);
        Direccion guardada = direccionRepository.save(direccion);
        log.info("Dirección {} creada para {}", guardada.getId(), email);
        return guardada;
    }

    @Transactional
    public Direccion actualizarDireccion(Long id, Direccion datos, String email) {
        Direccion direccion = getDireccionPorId(id, email);
        if (datos.getCalle() != null) {
            direccion.setCalle(datos.getCalle());
        }
        if (datos.getCiudad() != null) {
            direccion.setCiudad(datos.getCiudad());
        }
        if (datos.getProvincia() != null) {
            direccion.setProvincia(datos.getProvincia());
        }
        if (datos.getCodigoPostal() != null) {
            direccion.setCodigoPostal(datos.getCodigoPostal());
        }
        if (datos.getPais() != null) {
            direccion.setPais(datos.getPais());
        }
        Direccion actualizada = direccionRepository.save(direccion);
        log.info("Dirección {} actualizada", actualizada.getId());
        return actualizada;
    }

    @Transactional
    public void eliminarDireccion(Long id, String email) {
        Direccion direccion = getDireccionPorId(id, email);
        direccionRepository.delete(direccion);
        log.info("Dirección {} eliminada", id);
    }

    private Usuario buscarUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
