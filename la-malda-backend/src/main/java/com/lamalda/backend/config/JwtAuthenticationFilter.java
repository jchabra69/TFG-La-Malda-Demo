package com.lamalda.backend.config;

import com.lamalda.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    //Los filtros son la primera línea de DEFENSA en nuestra web - RECUERDA ESTO, ACORDE A LA TEORÍA DE SPRING BOOT

    //Cuando nosotros manejamos manualmente los login, generar el token etc sin depender de servicios externos, usamos JWT y no 0Auth2

    @Override
    protected void doFilterInternal(

            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain

    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        //Los token Bearer se usan para OAuth2/JWT, son los portadores que llevan nuestro token, es un pase a las funciones más delicadas de nuestra web
        //

        //Pide a las cabeceras el token bearere
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);

            return;
        }

        //lee lo que necesitamos, la línea donde está el tOKEN
        jwt = authHeader.substring(7);

        userEmail = jwtService.leerUsuario(jwt);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            //Este servicio propio de Spring Boot nos ayuda a cargar los datos del usuario junto a la base de datos
            //Y a buscar si este usuario tiene acceso etc. En este caso buscamos por email desde el token, en la cabecera del token veremos el email

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            if (jwtService.esTokenValido(jwt, userDetails)) {

                String role = jwtService.leerRol(jwt);

                //Parece ser que Spring Boot pone ROLE_ ya x defecto, así que tengo que poner esto para evitar
                //AL MISMO TIEMPO SPRING SOLO LEE MIS ROLES SI EMPIEZA POR ROLE ROLE_ADMIN, ROLE_CLIENTE por ejemplo

                String authority = role != null && role.toUpperCase().startsWith("ROLE_")

                        ? role.toUpperCase()
                        : "ROLE_" + (role != null ? role.toUpperCase() : "");

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority(authority))
                );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        //AHORA CONTINUA CON EL SIGUIENTE FILTRO
        filterChain.doFilter(request, response);
    }
}
