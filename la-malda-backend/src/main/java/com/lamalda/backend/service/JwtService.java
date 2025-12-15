package com.lamalda.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String SECRET_KEY;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    public String leerUsuario(String token) {
        return leerClaim(token, Claims::getSubject);
    }

    //Los claims son las confirmaciones para saber si nuestro usuario es el correcto, asignar roles o saber si el token siguien valido

    public <T> T leerClaim(String token, Function<Claims, T> claimsResolver) {

        final Claims claims = leerTodosLosClaims(token);

        return claimsResolver.apply(claims);
    }

    public String generarToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts
                .builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getClaveFirma(), Jwts.SIG.HS256)
                .compact();
    }


    public String generarTokenConRol(UserDetails userDetails, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        return generarToken(claims, userDetails);
    }

    public boolean esTokenValido(String token, UserDetails userDetails) {
        final String username = leerUsuario(token);
        return (username.equals(userDetails.getUsername())) && !estaTokenExpirado(token);
    }

    private boolean estaTokenExpirado(String token) {
        return leerExpiracion(token).before(new Date());
    }

    private Date leerExpiracion(String token) {
        return leerClaim(token, Claims::getExpiration);
    }

    //Con esto tmb leemos los payloads provenientes del cliente
    private Claims leerTodosLosClaims(String token) {
        return Jwts
                .parser()
                .verifyWith(getClaveFirma())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    //Traduce la clave al formato que pide Spring, esto es como el SSH e intercambio de claves, necesitamos comprobar que los JWT llevan nuestra firma declarada en application.properties
    private SecretKey getClaveFirma() {

        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);

        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String leerRol(String token) {
        Claims claims = leerTodosLosClaims(token);
        return claims.get("role", String.class);
    }
}
