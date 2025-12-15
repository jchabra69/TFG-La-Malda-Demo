package com.lamalda.backend.repository;

import com.lamalda.backend.model.entity.Pedido;
import com.lamalda.backend.model.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByUsuarioOrderByFechaDesc(Usuario usuario);

    Optional<Pedido> findByIdAndUsuario(Long id, Usuario usuario);

    List<Pedido> findAllByOrderByFechaDesc();
}
