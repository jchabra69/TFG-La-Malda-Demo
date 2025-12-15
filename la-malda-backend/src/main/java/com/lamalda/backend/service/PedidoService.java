package com.lamalda.backend.service;

import com.lamalda.backend.dto.PedidoDTO;
import com.lamalda.backend.exception.BadRequestException;
import com.lamalda.backend.exception.ResourceNotFoundException;
import com.lamalda.backend.model.entity.Carrito;
import com.lamalda.backend.model.entity.Direccion;
import com.lamalda.backend.model.entity.LineaPedido;
import com.lamalda.backend.model.entity.Pedido;
import com.lamalda.backend.model.entity.Producto;
import com.lamalda.backend.model.entity.Usuario;
import com.lamalda.backend.repository.CarritoRepository;
import com.lamalda.backend.repository.DireccionRepository;
import com.lamalda.backend.repository.PedidoRepository;
import com.lamalda.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PedidoService {

    private static final Set<String> ESTADOS_VALIDOS = Set.of(
            "PENDIENTE",
            "CONFIRMADO",
            "PREPARANDO",
            "ENVIADO",
            "ENTREGADO",
            "CANCELADO",
            "DEVUELTO"
    );

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final DireccionRepository direccionRepository;
    private final CarritoRepository carritoRepository;

    @Transactional
    public PedidoDTO crearPedido(PedidoDTO dto, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Direccion direccion = direccionRepository.findById(dto.getDireccionId())
                .orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada"));

        if (!direccion.getUsuario().getId().equals(usuario.getId())) {
            throw new BadRequestException("No puedes usar esta dirección");
        }

        List<Carrito> items = carritoRepository.findByUsuario(usuario);
        if (items.isEmpty()) {
            throw new BadRequestException("El carrito está vacío");
        }

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setDireccion(direccion);
        pedido.setEstado("PENDIENTE");
        pedido.setFecha(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;
        for (Carrito item : items) {
            Producto producto = item.getProducto();

            LineaPedido linea = new LineaPedido();
            linea.setProducto(producto);
            linea.setCantidad(item.getCantidad());
            linea.setPrecioUnitario(producto.getPrecio());
            pedido.addLinea(linea);

            total = total.add(
                    producto.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad()))
            );
        }

        pedido.setTotal(total);

        Pedido guardado = pedidoRepository.save(pedido);
        carritoRepository.deleteAll(items);

        log.info("Pedido {} creado para {}", guardado.getId(), email);
        return mapear(guardado);
    }

    @Transactional(readOnly = true)
    public List<PedidoDTO> getPedidosUsuario(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return pedidoRepository.findByUsuarioOrderByFechaDesc(usuario).stream()
                .map(this::mapear)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PedidoDTO getPedidoPorUsuario(Long id, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Pedido pedido = pedidoRepository.findByIdAndUsuario(id, usuario)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        return mapear(pedido);
    }

    @Transactional(readOnly = true)
    public List<PedidoDTO> getTodosPedidos() {
        return pedidoRepository.findAllByOrderByFechaDesc().stream()
                .map(this::mapear)
                .collect(Collectors.toList());
    }

    @Transactional
    public PedidoDTO actualizarEstado(Long pedidoId, String nuevoEstado) {
        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            throw new BadRequestException("El estado es obligatorio");
        }
        String estadoNormalizado = nuevoEstado.trim().toUpperCase();
        if (!ESTADOS_VALIDOS.contains(estadoNormalizado)) {
            throw new BadRequestException("Estado no válido");
        }

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));
        pedido.setEstado(estadoNormalizado);

        return mapear(pedido);
    }

    private PedidoDTO mapear(Pedido pedido) {
        PedidoDTO dto = new PedidoDTO();
        dto.setId(pedido.getId());
        dto.setUsuarioId(pedido.getUsuario().getId());
        String nombreCompleto = String.format("%s %s",
                pedido.getUsuario().getNombre(),
                pedido.getUsuario().getApellidos()).trim();
        dto.setUsuarioNombre(nombreCompleto);
        dto.setUsuarioEmail(pedido.getUsuario().getEmail());
        dto.setDireccionId(pedido.getDireccion().getId());
        dto.setDireccion(PedidoDTO.DireccionPedido.builder()
                .id(pedido.getDireccion().getId())
                .calle(pedido.getDireccion().getCalle())
                .ciudad(pedido.getDireccion().getCiudad())
                .provincia(pedido.getDireccion().getProvincia())
                .codigoPostal(pedido.getDireccion().getCodigoPostal())
                .pais(pedido.getDireccion().getPais())
                .build());
        dto.setTotal(pedido.getTotal());
        dto.setEstado(pedido.getEstado());
        dto.setFecha(pedido.getFecha());
        dto.setLineas(pedido.getLineas().stream()
                .map(linea -> PedidoDTO.LineaPedido.builder()
                        .productoId(linea.getProducto().getId())
                        .nombreProducto(linea.getProducto().getNombre())
                        .cantidad(linea.getCantidad())
                        .precioUnitario(linea.getPrecioUnitario())
                        .subtotal(linea.calcularSubtotal())
                        .build())
                .collect(Collectors.toList()));
        return dto;
    }
}
