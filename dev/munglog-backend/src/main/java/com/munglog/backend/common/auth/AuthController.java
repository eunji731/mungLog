package com.munglog.backend.common.auth;

import com.munglog.backend.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Arrays;
import java.util.UUID;

/**
 * 인증 관련 REST 컨트롤러.
 * 토큰 재발급(reissue)과 로그아웃을 처리한다.
 * 토큰은 쿠키를 통해 주고받으며, HttpOnly 설정으로 XSS 공격을 방지한다.
 */
@Tag(name = "인증", description = "토큰 재발급 및 로그아웃 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    /** 쿠키의 Secure 속성 여부 (HTTPS 환경에서 true로 설정) */
    @Value("${app.cookie.secure:false}")
    private boolean secure;

    /**
     * [목적] 만료된 액세스 토큰을 리프레시 토큰으로 재발급한다.
     * [설명] 쿠키에서 refreshToken을 읽어 유효성을 검증하고,
     *        새 액세스 토큰을 발급하여 accessToken 쿠키에 설정한다.
     *
     * @param request  HTTP 요청 (refreshToken 쿠키 포함)
     * @param response HTTP 응답 (새 accessToken 쿠키 설정)
     * @return 성공/실패 응답
     */
    @Operation(summary = "Access Token 재발급")
    @PostMapping("/reissue")
    public ResponseEntity<ApiResponse<Void>> reissue(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractCookie(request, "refreshToken");
        if (refreshToken == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("리프레시 토큰이 없습니다.", "NO_REFRESH_TOKEN"));
        }
        String newAccessToken = authService.reissue(refreshToken);
        addCookie(response, "accessToken", newAccessToken, (int) Duration.ofHours(24).toSeconds());
        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * [목적] 현재 로그인된 사용자를 로그아웃한다.
     * [설명] DB에서 리프레시 토큰을 무효화하고,
     *        accessToken과 refreshToken 쿠키를 만료시킨다.
     *
     * @param user     현재 인증된 사용자 (Spring Security 컨텍스트)
     * @param response HTTP 응답 (쿠키 만료 처리)
     * @return 성공 응답
     */
    @Operation(summary = "로그아웃")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal User user,
                                                     HttpServletResponse response) {
        authService.logout(UUID.fromString(user.getUsername()));
        clearCookie(response, "accessToken");
        clearCookie(response, "refreshToken");
        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * [목적] HTTP 요청의 쿠키에서 특정 이름의 쿠키 값을 추출한다.
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

    /**
     * [목적] HttpOnly 쿠키를 응답에 추가한다.
     *
     * @param response HTTP 응답 객체
     * @param name     쿠키 이름
     * @param value    쿠키 값
     * @param maxAge   쿠키 유효시간 (초 단위)
     */
    private void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true).secure(secure).path("/").maxAge(maxAge).sameSite("Lax").build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    /**
     * [목적] 쿠키를 즉시 만료시켜 삭제 효과를 낸다.
     *
     * @param response HTTP 응답 객체
     * @param name     삭제할 쿠키 이름
     */
    private void clearCookie(HttpServletResponse response, String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true).secure(secure).path("/").maxAge(0).sameSite("Lax").build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
