package com.lamalda.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoDTO {

    private Long id;

    private Long usuarioId;

    private String usuarioNombre;

    private String usuarioEmail;

    @NotNull(message = "La dirección es obligatoria")
    private Long direccionId;

    private BigDecimal total;

    private String estado;

    private LocalDateTime fecha;

    private DireccionPedido direccion;

    @Builder.Default
    private List<LineaPedido> lineas = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LineaPedido {
        private Long productoId;
        private String nombreProducto;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DireccionPedido {
        private Long id;
        private String calle;
        private String ciudad;
        private String provincia;
        private String codigoPostal;
        private String pais;
    }
}
