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

@Tag(name = "인증", description = "토큰 재발급 및 로그아웃 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Value("${app.cookie.secure:false}")
    private boolean secure;

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

    @Operation(summary = "로그아웃")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal User user,
                                                     HttpServletResponse response) {
        authService.logout(UUID.fromString(user.getUsername()));
        clearCookie(response, "accessToken");
        clearCookie(response, "refreshToken");
        return ResponseEntity.ok(ApiResponse.success());
    }

    private String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true).secure(secure).path("/").maxAge(maxAge).sameSite("Lax").build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearCookie(HttpServletResponse response, String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true).secure(secure).path("/").maxAge(0).sameSite("Lax").build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
