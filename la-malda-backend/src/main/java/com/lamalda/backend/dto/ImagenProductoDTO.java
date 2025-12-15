package com.lamalda.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImagenProductoDTO {

    private Long id;
    private Long productoId;
    private String url;
    private Boolean esPrincipal;
    private Integer orden;
}
