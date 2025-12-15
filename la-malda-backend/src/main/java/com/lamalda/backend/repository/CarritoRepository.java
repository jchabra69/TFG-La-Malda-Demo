package com.lamalda.backend.repository;

import com.lamalda.backend.model.entity.Carrito;
import com.lamalda.backend.model.entity.Producto;
import com.lamalda.backend.model.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Long> {

    List<Carrito> findByUsuarioOrderByIdDesc(Usuario usuario);

    List<Carrito> findByUsuario(Usuario usuario);


    List<Carrito> findByIdSesionOrderByIdDesc(String idSesion);

    Optional<Carrito> findByUsuarioAndProducto(Usuario usuario, Producto producto);

    Optional<Carrito> findByIdSesionAndProducto(String idSesion, Producto producto);

    @Modifying
    @Query("DELETE FROM Carrito c WHERE c.usuario = :usuario")
    void eliminarPorUsuario(@Param("usuario") Usuario usuario);

    @Modifying
    @Query("DELETE FROM Carrito c WHERE c.idSesion = :idSesion")
    void eliminarPorSesion(@Param("idSesion") String idSesion);
}
