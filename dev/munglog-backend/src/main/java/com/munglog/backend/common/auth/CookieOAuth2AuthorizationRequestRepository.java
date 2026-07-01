package com.munglog.backend.common.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.util.SerializationUtils;

import java.util.Base64;

/**
 * STATELESS 세션 환경에서 OAuth2 인가 요청 정보를 쿠키에 저장하는 저장소.
 * 세션을 사용하지 않으므로 카카오 로그인의 state 파라미터를 쿠키로 임시 보관하여
 * CSRF 공격을 방지한다. 쿠키 유효시간은 3분(180초)이다.
 */
public class CookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    /** OAuth2 인가 요청을 담는 쿠키 이름 */
    private static final String COOKIE_NAME = "oauth2_auth_request";

    /** 쿠키 유효 시간 (초 단위, 3분) */
    private static final int COOKIE_MAX_AGE = 180;

    /**
     * [목적] 쿠키에서 OAuth2 인가 요청 객체를 읽어온다.
     *
     * @param request HTTP 요청 객체
     * @return 저장된 인가 요청 객체 (없으면 null)
     */
    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return getCookieValue(request).map(this::deserialize).orElse(null);
    }

    /**
     * [목적] OAuth2 인가 요청 객체를 쿠키에 저장한다.
     * [설명] authorizationRequest가 null이면 기존 쿠키를 삭제하고,
     *        값이 있으면 직렬화(Base64)하여 HttpOnly 쿠키로 설정한다.
     *
     * @param authorizationRequest 저장할 인가 요청 객체 (null이면 삭제)
     * @param request              HTTP 요청 객체
     * @param response             HTTP 응답 객체 (쿠키 설정 대상)
     */
    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                         HttpServletRequest request, HttpServletResponse response) {
        if (authorizationRequest == null) {
            deleteCookie(response);
            return;
        }
        String encoded = Base64.getUrlEncoder().encodeToString(SerializationUtils.serialize(authorizationRequest));
        Cookie cookie = new Cookie(COOKIE_NAME, encoded);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(COOKIE_MAX_AGE);
        response.addCookie(cookie);
    }

    /**
     * [목적] 쿠키에서 인가 요청 객체를 읽고 쿠키를 즉시 삭제한다.
     * [설명] 콜백 처리 후 쿠키가 남지 않도록 읽는 동시에 삭제한다.
     *
     * @param request  HTTP 요청 객체
     * @param response HTTP 응답 객체 (쿠키 삭제 대상)
     * @return 저장되어 있던 인가 요청 객체 (없으면 null)
     */
    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
                                                                  HttpServletResponse response) {
        OAuth2AuthorizationRequest req = loadAuthorizationRequest(request);
        deleteCookie(response);
        return req;
    }

    /**
     * [목적] 요청 쿠키에서 OAuth2 인가 요청 쿠키의 값을 찾아 반환한다.
     *
     * @param request HTTP 요청 객체
     * @return 쿠키 값을 담은 Optional (없으면 empty)
     */
    private java.util.Optional<String> getCookieValue(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return java.util.Optional.empty();
        for (Cookie cookie : cookies) {
            if (COOKIE_NAME.equals(cookie.getName())) {
                return java.util.Optional.of(cookie.getValue());
            }
        }
        return java.util.Optional.empty();
    }

    /**
     * [목적] OAuth2 인가 요청 쿠키를 만료시켜 삭제한다.
     *
     * @param response HTTP 응답 객체
     */
    private void deleteCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(COOKIE_NAME, "");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    /**
     * [목적] Base64로 인코딩된 쿠키 값을 OAuth2AuthorizationRequest 객체로 역직렬화한다.
     *
     * @param value Base64 인코딩된 직렬화 문자열
     * @return 역직렬화된 인가 요청 객체 (실패 시 null)
     */
    @SuppressWarnings("deprecation")
    private OAuth2AuthorizationRequest deserialize(String value) {
        try {
            byte[] bytes = Base64.getUrlDecoder().decode(value);
            return (OAuth2AuthorizationRequest) SerializationUtils.deserialize(bytes);
        } catch (Exception e) {
            return null;
        }
    }
}
