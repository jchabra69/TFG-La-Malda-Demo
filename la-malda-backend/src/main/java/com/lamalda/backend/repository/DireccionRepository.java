package com.lamalda.backend.repository;

import com.lamalda.backend.model.entity.Direccion;
import com.lamalda.backend.model.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DireccionRepository extends JpaRepository<Direccion, Long> {

    List<Direccion> findByUsuarioOrderByIdDesc(Usuario usuario);

    Optional<Direccion> findByIdAndUsuario(Long id, Usuario usuario);
}
