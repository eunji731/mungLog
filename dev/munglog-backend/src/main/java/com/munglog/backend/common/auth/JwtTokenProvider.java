package com.munglog.backend.common.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String createAccessToken(String userId, String role) {
        return buildToken(userId, role, expirationMs, "access");
    }

    public String createRefreshToken(String userId, String role) {
        return buildToken(userId, role, 14L * 24 * 60 * 60 * 1000, "refresh");
    }

    public String createRejoinToken(String userId, String role) {
        return buildToken(userId, role, 10L * 60 * 1000, "rejoin");
    }

    private String buildToken(String userId, String role, long ttl, String type) {
        Date now = new Date();
        return Jwts.builder()
                .subject(userId)
                .claim("role", role)
                .claim("type", type)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + ttl))
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT 검증 실패: {}", e.getMessage());
            return false;
        }
    }

    public String getUserId(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isRejoinToken(String token) {
        try {
            Claims claims = getClaims(token);
            return "rejoin".equals(claims.get("type", String.class));
        } catch (Exception e) {
            return false;
        }
    }

    public Authentication getAuthentication(String token) {
        Claims claims = getClaims(token);
        String role = claims.get("role", String.class);
        User principal = new User(claims.getSubject(), "", List.of(new SimpleGrantedAuthority(role)));
        return new UsernamePasswordAuthenticationToken(principal, token, principal.getAuthorities());
    }

    private Claims getClaims(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
    }
}
