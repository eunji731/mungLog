package com.munglog.backend.common.auth;

import com.munglog.backend.domain.member.repository.MemberRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.UUID;

/**
 * 모든 HTTP 요청에 대해 JWT 토큰을 검증하는 필터 클래스.
 * 요청당 한 번만 실행되며(OncePerRequestFilter),
 * 쿠키의 accessToken을 읽어 유효하면 SecurityContext에 인증 정보를 설정한다.
 * 탈퇴 처리된 사용자(isActive=false)는 인증을 거부한다.
 */
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;

    /**
     * [목적] 요청마다 JWT 토큰을 검증하고 인증 정보를 SecurityContext에 저장한다.
     * [설명] 1) 쿠키에서 accessToken 추출 → 2) JWT 유효성 검증
     *        → 3) DB에서 사용자 활성 상태 확인 → 4) SecurityContext에 Authentication 설정.
     *        토큰이 없거나 유효하지 않으면 인증 설정 없이 다음 필터로 넘어간다.
     *
     * @param request     HTTP 요청 객체
     * @param response    HTTP 응답 객체
     * @param filterChain 다음 필터 체인
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = extractCookie(request, "accessToken");

        if (token != null && jwtTokenProvider.validateToken(token)) {
            String userId = jwtTokenProvider.getUserId(token);
            boolean isActive = memberRepository.findById(UUID.fromString(userId))
                    .map(m -> m.getIsActive())
                    .orElse(false);

            if (isActive) {
                SecurityContextHolder.getContext().setAuthentication(
                        jwtTokenProvider.getAuthentication(token));
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * [목적] HTTP 요청 쿠키에서 특정 이름의 쿠키 값을 추출한다.
     *
     * @param request HTTP 요청 객체
     * @param name    찾을 쿠키 이름
     * @return 쿠키 값 (없으면 null)
     */
    private String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
