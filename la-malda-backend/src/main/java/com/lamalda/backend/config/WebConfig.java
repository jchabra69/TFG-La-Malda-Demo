package com.lamalda.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final String DIRECTORIO_SUBIDAS = "uploads";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path ruta = Paths.get(DIRECTORIO_SUBIDAS).toAbsolutePath().normalize();
        registry.addResourceHandler("/media/**")
                .addResourceLocations(ruta.toUri().toString());
    }
}
