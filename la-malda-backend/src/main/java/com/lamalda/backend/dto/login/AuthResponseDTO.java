package com.lamalda.backend.dto.login;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private Long id;
    private String email;
    private String nombre;
    private String apellidos;
    private String telefono;
    private String rol;
    private Boolean activo;
    private String token;
    private String mensaje;
}
