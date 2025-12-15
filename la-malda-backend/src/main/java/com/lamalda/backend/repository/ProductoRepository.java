package com.lamalda.backend.repository;

import com.lamalda.backend.model.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Producto> findByCategoriaId(Long categoriaId);

    List<Producto> findByNombreContainingIgnoreCase(String nombre);

    @Query("SELECT p.categoria.id, COUNT(p.id) FROM Producto p GROUP BY p.categoria.id")
    List<Object[]> contarProductosPorCategoria();
}
