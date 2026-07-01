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

/**
 * JWT 토큰 생성, 검증, 파싱을 담당하는 컴포넌트 클래스.
 * 액세스 토큰(24시간), 리프레시 토큰(14일), 재가입 토큰(10분) 세 종류를 발급한다.
 * 토큰에는 사용자 ID(subject), 권한(role), 토큰 종류(type) 정보가 포함된다.
 */
@Slf4j
@Component
public class JwtTokenProvider {

    /** 액세스 토큰 유효 시간: 24시간 */
    private static final long ACCESS_TOKEN_EXPIRATION_MS = 24L * 60 * 60 * 1000;

    /** 리프레시 토큰 유효 시간: 14일 */
    private static final long REFRESH_TOKEN_EXPIRATION_MS = 14L * 24 * 60 * 60 * 1000;

    /** 재가입 토큰 유효 시간: 10분 */
    private static final long REJOIN_TOKEN_EXPIRATION_MS = 10L * 60 * 1000;

    /** HMAC-SHA 서명에 사용하는 비밀 키 */
    private final SecretKey key;

    /** 액세스 토큰 만료 시간 (application.yml에서 설정 가능, 기본값: 위 상수) */
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    /**
     * [목적] 사용자 ID와 권한 정보로 액세스 토큰을 발급한다.
     *
     * @param userId 사용자 UUID 문자열
     * @param role   사용자 권한 (예: ROLE_USER, ROLE_ADMIN)
     * @return 서명된 JWT 액세스 토큰 문자열
     */
    public String createAccessToken(String userId, String role) {
        return buildToken(userId, role, expirationMs, "access");
    }

    /**
     * [목적] 액세스 토큰 재발급에 사용할 리프레시 토큰을 발급한다.
     *
     * @param userId 사용자 UUID 문자열
     * @param role   사용자 권한
     * @return 서명된 JWT 리프레시 토큰 문자열 (유효 기간 14일)
     */
    public String createRefreshToken(String userId, String role) {
        return buildToken(userId, role, REFRESH_TOKEN_EXPIRATION_MS, "refresh");
    }

    /**
     * [목적] 탈퇴 후 재가입 흐름에서 임시로 사용할 단기 토큰을 발급한다.
     *
     * @param userId 사용자 UUID 문자열
     * @param role   사용자 권한
     * @return 서명된 JWT 재가입 토큰 문자열 (유효 기간 10분)
     */
    public String createRejoinToken(String userId, String role) {
        return buildToken(userId, role, REJOIN_TOKEN_EXPIRATION_MS, "rejoin");
    }

    /**
     * [목적] 공통 JWT 빌드 로직. 토큰 종류(type)만 다르고 구조는 동일하다.
     *
     * @param userId 사용자 UUID 문자열 (JWT subject)
     * @param role   사용자 권한
     * @param ttl    토큰 유효 시간 (밀리초)
     * @param type   토큰 종류 ("access", "refresh", "rejoin")
     * @return 서명된 JWT 토큰 문자열
     */
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

    /**
     * [목적] JWT 토큰의 서명과 만료 여부를 검증한다.
     *
     * @param token 검증할 JWT 토큰 문자열
     * @return 유효하면 true, 그렇지 않으면 false
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT 검증 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * [목적] JWT 토큰에서 사용자 ID(subject)를 추출한다.
     *
     * @param token JWT 토큰 문자열
     * @return 토큰에 담긴 사용자 UUID 문자열
     */
    public String getUserId(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * [목적] 해당 토큰이 재가입용 토큰인지 확인한다.
     *
     * @param token JWT 토큰 문자열
     * @return 재가입 토큰이면 true
     */
    public boolean isRejoinToken(String token) {
        try {
            Claims claims = getClaims(token);
            return "rejoin".equals(claims.get("type", String.class));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * [목적] JWT 토큰에서 Spring Security Authentication 객체를 생성한다.
     * [설명] 토큰의 subject(사용자 ID)와 role 클레임으로
     *        UsernamePasswordAuthenticationToken을 구성하여 반환한다.
     *
     * @param token 유효한 JWT 토큰 문자열
     * @return Spring Security 인증 객체
     */
    public Authentication getAuthentication(String token) {
        Claims claims = getClaims(token);
        String role = claims.get("role", String.class);
        User principal = new User(claims.getSubject(), "", List.of(new SimpleGrantedAuthority(role)));
        return new UsernamePasswordAuthenticationToken(principal, token, principal.getAuthorities());
    }

    /**
     * [목적] JWT 토큰을 파싱하여 Claims 객체를 반환한다.
     *
     * @param token JWT 토큰 문자열
     * @return 파싱된 Claims 객체
     */
    private Claims getClaims(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
    }
}
