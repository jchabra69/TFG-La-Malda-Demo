package com.lamalda.backend.repository;

import com.lamalda.backend.model.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByCategoriaPadreIsNullOrderByNombreAsc();

    List<Categoria> findByCategoriaPadreIdOrderByNombreAsc(Long parentId);

    Optional<Categoria> findBySlug(String slug);
}
