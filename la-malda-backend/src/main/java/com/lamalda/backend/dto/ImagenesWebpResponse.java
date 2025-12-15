package com.lamalda.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ImagenesWebpResponse {
    private String nombreArchivo;
    private String url;

    public ImagenesWebpResponse() {}

    public ImagenesWebpResponse(String nombreArchivo, String url) {
        this.nombreArchivo = nombreArchivo;
        this.url = url;
    }

}
