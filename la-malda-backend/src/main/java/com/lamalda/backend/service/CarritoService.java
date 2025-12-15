package com.lamalda.backend.service;

import com.lamalda.backend.exception.BadRequestException;
import com.lamalda.backend.exception.ResourceNotFoundException;
import com.lamalda.backend.model.entity.Carrito;
import com.lamalda.backend.model.entity.Producto;
import com.lamalda.backend.model.entity.Usuario;
import com.lamalda.backend.repository.CarritoRepository;
import com.lamalda.backend.repository.ProductoRepository;
import com.lamalda.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getCarrito(String email, String idSesion) {
        List<Carrito> items = obtenerItems(email, idSesion);

        List<Map<String, Object>> productos = items.stream()
                .map(this::aMapaItem)
                .collect(Collectors.toList());

        int totalProductos = items.stream().mapToInt(Carrito::getCantidad).sum();
        BigDecimal subtotal = productos.stream()
                .map(mapa -> (BigDecimal) mapa.get("subtotal"))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> response = new HashMap<>();
        response.put("productos", productos);
        response.put("totalProductos", totalProductos);
        response.put("subtotal", subtotal);
        return response;
    }

    @Transactional
    public Map<String, Object> meterAlCarrito(Long productoId, Integer cantidad, String email, String idSesion) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        int cantidadSolicitada = cantidad != null && cantidad > 0 ? cantidad : 1;
        Carrito carrito;

        if (email != null) {
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

            carrito = carritoRepository.findByUsuarioAndProducto(usuario, producto)
                    .orElse(new Carrito());

            if (carrito.getId() == null) {
                carrito.setUsuario(usuario);
                carrito.setProducto(producto);
                carrito.setCantidad(cantidadSolicitada);
            } else {
                carrito.setCantidad(carrito.getCantidad() + cantidadSolicitada);
            }
        } else {
            if (idSesion == null || idSesion.isBlank()) {
                throw new BadRequestException("ID de sesión requerido para usuarios invitados");
            }

            carrito = carritoRepository.findByIdSesionAndProducto(idSesion, producto)
                    .orElse(new Carrito());

            if (carrito.getId() == null) {
                carrito.setIdSesion(idSesion);
                carrito.setProducto(producto);
                carrito.setCantidad(cantidadSolicitada);
            } else {
                carrito.setCantidad(carrito.getCantidad() + cantidadSolicitada);
            }
        }

        Carrito guardado = carritoRepository.save(carrito);
        log.info("Producto {} agregado al carrito {}", producto.getId(), guardado.getId());
        return aMapaItem(guardado);
    }

    @Transactional
    public Map<String, Object> actualizarCantidad(Long carritoId, Integer cantidad, String email) {
        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(() -> new ResourceNotFoundException("Item del carrito no encontrado"));

        if (email != null) {
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
            if (carrito.getUsuario() == null || !carrito.getUsuario().equals(usuario)) {
                throw new BadRequestException("No tienes permiso para modificar este item");
            }
        }

        if (cantidad == null || cantidad <= 0) {
            throw new BadRequestException("La cantidad debe ser mayor que cero");
        }

        carrito.setCantidad(cantidad);
        Carrito actualizado = carritoRepository.save(carrito);
        log.info("Cantidad actualizada en carrito: {}", actualizado.getId());

        return aMapaItem(actualizado);
    }

    @Transactional
    public void eliminarDelCarrito(Long carritoId, String email) {
        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(() -> new ResourceNotFoundException("Item del carrito no encontrado"));

        if (email != null) {
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
            if (carrito.getUsuario() == null || !carrito.getUsuario().equals(usuario)) {
                throw new BadRequestException("No tienes permiso para eliminar este item");
            }
        }

        carritoRepository.delete(carrito);
        log.info("Item eliminado del carrito: {}", carritoId);
    }

    @Transactional
    public void vaciarCarrito(String email, String idSesion) {
        if (email != null) {
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
            carritoRepository.eliminarPorUsuario(usuario);
            log.info("Carrito vaciado para usuario: {}", email);
        } else if (idSesion != null) {
            carritoRepository.eliminarPorSesion(idSesion);
            log.info("Carrito vaciado para sesión: {}", idSesion);
        }
    }

    @Transactional
    public void transferirCarrito(String idSesion, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<Carrito> itemsSesion = carritoRepository.findByIdSesionOrderByIdDesc(idSesion);
        List<Carrito> itemsUsuario = carritoRepository.findByUsuarioOrderByIdDesc(usuario);

        for (Carrito itemSesion : itemsSesion) {
            Carrito existente = itemsUsuario.stream()
                    .filter(item -> item.getProducto().getId().equals(itemSesion.getProducto().getId()))
                    .findFirst()
                    .orElse(null);

            if (existente != null) {
                existente.setCantidad(existente.getCantidad() + itemSesion.getCantidad());
                carritoRepository.save(existente);
                carritoRepository.delete(itemSesion);
            } else {
                itemSesion.setUsuario(usuario);
                itemSesion.setIdSesion(null);
                Carrito guardado = carritoRepository.save(itemSesion);
                itemsUsuario.add(guardado);
            }
        }

        log.info("Carrito transferido de sesión {} a usuario {}", idSesion, email);
    }

    private List<Carrito> obtenerItems(String email, String idSesion) {
        if (email != null) {
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
            return carritoRepository.findByUsuarioOrderByIdDesc(usuario);
        }
        if (idSesion != null) {
            return carritoRepository.findByIdSesionOrderByIdDesc(idSesion);
        }
        throw new BadRequestException("Debe proporcionar email o ID de sesión");
    }

    private Map<String, Object> aMapaItem(Carrito carrito) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", carrito.getId());
        map.put("productoId", carrito.getProducto().getId());
        map.put("nombreProducto", carrito.getProducto().getNombre());
        map.put("imagenUrl", carrito.getProducto().getImagenUrl());
        map.put("cantidad", carrito.getCantidad());
        BigDecimal precioUnitario = carrito.getProducto().getPrecio();
        map.put("precioUnitario", precioUnitario);
        map.put("subtotal", precioUnitario.multiply(BigDecimal.valueOf(carrito.getCantidad())));
        return map;
    }
}
