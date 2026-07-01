package com.munglog.backend.common.auth;

import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.UUID;

/**
 * 카카오 OAuth2 로그인 성공 시 처리하는 핸들러 클래스.
 * 로그인 성공 후 JWT 토큰을 발급하여 쿠키에 설정하고 프론트엔드로 리다이렉트한다.
 * 탈퇴 처리된 사용자(isActive=false)는 재가입 페이지로 리다이렉트한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;

    /** 로그인 성공 후 리다이렉트할 프론트엔드 URL */
    @Value("${app.frontend-url}")
    private String frontendUrl;

    /** 쿠키 Secure 속성 여부 (HTTPS 환경에서 true) */
    @Value("${app.cookie.secure:false}")
    private boolean secure;

    /** 쿠키 Domain 속성 (설정하지 않으면 현재 도메인) */
    @Value("${app.cookie.domain:}")
    private String domain;

    /**
     * [목적] OAuth2 인증 성공 후 JWT 토큰을 발급하고 프론트엔드로 리다이렉트한다.
     * [설명] 1) 인증된 사용자의 ID로 DB에서 회원 조회
     *        → 2) 탈퇴 상태면 rejoin 토큰과 함께 재가입 페이지로 리다이렉트
     *        → 3) 정상 상태면 accessToken/refreshToken 쿠키 설정 후 메인 페이지로 리다이렉트.
     *        리프레시 토큰은 SHA-256 해시 후 DB에 저장한다.
     *
     * @param request        HTTP 요청 객체
     * @param response       HTTP 응답 객체 (쿠키 설정 및 리다이렉트)
     * @param authentication 카카오 인증 성공 후 생성된 인증 객체
     * @throws IOException 리다이렉트 처리 실패 시
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        DefaultOAuth2User principal = (DefaultOAuth2User) authentication.getPrincipal();
        String userId = (String) principal.getAttributes().get("id");

        Member member = memberRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!member.getIsActive()) {
            String rejoinToken = jwtTokenProvider.createRejoinToken(userId, member.getRole());
            response.sendRedirect(frontendUrl + "/rejoin?token=" + rejoinToken);
            return;
        }

        String accessToken = jwtTokenProvider.createAccessToken(userId, member.getRole());
        String refreshToken = jwtTokenProvider.createRefreshToken(userId, member.getRole());
        member.updateRefreshToken(sha256(refreshToken));
        memberRepository.save(member);

        addCookie(response, "accessToken", accessToken, (int) Duration.ofHours(24).toSeconds());
        addCookie(response, "refreshToken", refreshToken, (int) Duration.ofDays(14).toSeconds());

        response.sendRedirect(frontendUrl);
    }

    /**
     * [목적] HttpOnly 쿠키를 응답 헤더에 추가한다.
     * [설명] domain 설정이 있으면 Domain 속성도 함께 설정하여 서브도메인 공유를 허용한다.
     *
     * @param response HTTP 응답 객체
     * @param name     쿠키 이름
     * @param value    쿠키 값
     * @param maxAge   쿠키 유효 시간 (초 단위)
     */
    private void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax");
        if (domain != null && !domain.isBlank()) {
            builder.domain(domain);
        }
        response.addHeader(HttpHeaders.SET_COOKIE, builder.build().toString());
    }

    /**
     * [목적] 리프레시 토큰 원문을 SHA-256으로 해시하여 DB 저장용 해시값을 생성한다.
     *
     * @param input 해시할 문자열
     * @return 16진수 SHA-256 해시 문자열
     */
    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
