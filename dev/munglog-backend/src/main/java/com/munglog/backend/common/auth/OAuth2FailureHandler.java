package com.munglog.backend.common.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

/**
 * 카카오 OAuth2 로그인 실패 시 처리하는 핸들러 클래스.
 * 인증 실패 시 HTTP 401 상태와 JSON 에러 응답을 반환한다.
 * 프론트엔드가 JSON 응답으로 실패를 감지하도록 리다이렉트 대신 JSON 응답을 사용한다.
 */
@Component
@RequiredArgsConstructor
public class OAuth2FailureHandler implements AuthenticationFailureHandler {

    private final ObjectMapper objectMapper;

    /**
     * [목적] OAuth2 인증 실패 시 JSON 형식의 에러 응답을 반환한다.
     *
     * @param request   HTTP 요청 객체
     * @param response  HTTP 응답 객체 (상태 코드 401, JSON 에러 설정)
     * @param exception 발생한 인증 예외
     * @throws IOException 응답 쓰기 실패 시
     */
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(),
                Map.of("success", false, "error", Map.of("message", "카카오 로그인에 실패했습니다.", "code", "AUTH_FAILED")));
    }
}
