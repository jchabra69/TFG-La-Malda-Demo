package com.lamalda.backend.controller;

import com.lamalda.backend.dto.ImagenesWebpResponse;
import com.lamalda.backend.exception.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/admin/imagenes-webp")
public class ImagenesWebpController {

    private static final String DIRECTORIO = "uploads/imagenes-webp";
    private static final long TAMANO_MAX = 3 * 1024 * 1024;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ImagenesWebpResponse> subir(@RequestParam("file") MultipartFile archivo) throws IOException {
        validar(archivo);

        Path dir = prepararDirectorio();

        String nombre = nombreSeguro(archivo.getOriginalFilename());

        Path destino = dir.resolve(nombre);

        Files.copy(archivo.getInputStream(), destino);

        String url = "/media/imagenes-webp/" + nombre;

        return ResponseEntity.status(HttpStatus.CREATED).body(new ImagenesWebpResponse(nombre, url));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ImagenesWebpResponse>> listar() throws IOException {

        Path dir = prepararDirectorio();

        List<ImagenesWebpResponse> lista = new ArrayList<>();

        try (Stream<Path> stream = Files.list(dir)) {

            stream.filter(Files::isRegularFile)

                    .forEach(p -> lista.add(new ImagenesWebpResponse(p.getFileName().toString(), "/media/imagenes-webp/" + p.getFileName())));
        }
        return ResponseEntity.ok(lista);
    }

    private void validar(MultipartFile archivo) {

        if (archivo == null || archivo.isEmpty()) {
            throw new BadRequestException("El archivo no puede estar vacío");

        }
        if (archivo.getSize() > TAMANO_MAX) {
            throw new BadRequestException("El archivo supera el tamaño máximo permitido (3MB)");
        }
        String nombre = archivo.getOriginalFilename() != null ? archivo.getOriginalFilename().toLowerCase(Locale.ROOT) : "";
        String tipo = archivo.getContentType() != null ? archivo.getContentType().toLowerCase(Locale.ROOT) : "";
        boolean extensionValida = nombre.endsWith(".webp");

        //Solo admitiré este tipo de ficheros, por lo tanto a la pettición solo escucharemos las de Content/type con este formato .webp
        //A esto se le llama un MIME
        boolean mimeValido = "image/webp".equals(tipo) || tipo.contains("webp");

        if (!extensionValida || !mimeValido) {
            throw new BadRequestException("Solo se permiten imágenes .webp");
        }
    }

    private Path prepararDirectorio() throws IOException {
        Path dir = Paths.get(DIRECTORIO).toAbsolutePath().normalize();
        Files.createDirectories(dir);
        return dir;
    }

    private String nombreSeguro(String nombreOriginal) {

        String base = StringUtils.hasText(nombreOriginal) ? nombreOriginal : "imagen";

        base = base.replaceAll("[^a-zA-Z0-9-_\\.]", "_");

        return UUID.randomUUID().toString().substring(0, 8) + "-" + Instant.now().toEpochMilli() + "-" + base;
    }
}
