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

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.cookie.secure:false}")
    private boolean secure;

    @Value("${app.cookie.domain:}")
    private String domain;

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
