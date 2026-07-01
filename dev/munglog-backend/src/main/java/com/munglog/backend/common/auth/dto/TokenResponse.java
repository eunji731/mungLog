package com.munglog.backend.common.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 로그인 성공 시 클라이언트에 전달하는 토큰 응답 DTO.
 * accessToken과 refreshToken을 함께 반환한다.
 */
@Getter
@AllArgsConstructor
public class TokenResponse {
    /** JWT 액세스 토큰 (단기 유효, API 인증에 사용) */
    private String accessToken;

    /** JWT 리프레시 토큰 (장기 유효, 액세스 토큰 재발급에 사용) */
    private String refreshToken;
}
