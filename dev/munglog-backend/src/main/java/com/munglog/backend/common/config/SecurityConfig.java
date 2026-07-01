package com.munglog.backend.common.config;

import com.munglog.backend.common.auth.CustomOAuth2UserService;
import com.munglog.backend.common.auth.JwtAuthenticationFilter;
import com.munglog.backend.common.auth.JwtTokenProvider;
import com.munglog.backend.common.auth.OAuth2FailureHandler;
import com.munglog.backend.common.auth.OAuth2SuccessHandler;
import com.munglog.backend.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security 설정 클래스.
 * JWT 기반 Stateless 인증, 카카오 OAuth2 로그인, CORS, 권한별 접근 제어를 설정한다.
 * 세션을 사용하지 않으므로(STATELESS) 모든 요청은 쿠키의 JWT 토큰으로 인증한다.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final OAuth2FailureHandler oAuth2FailureHandler;
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;

    /** 허용할 CORS 오리진 목록 (쉼표 구분, 예: http://localhost:3000,https://munglog.com) */
    @Value("${app.cors.allowed-origins}")
    private String allowedOriginsRaw;

    /**
     * [목적] Spring Security 필터 체인을 구성하고 등록한다.
     * [설명] - CSRF 비활성화 (JWT+쿠키 방식 사용)
     *        - CORS 설정 적용
     *        - STATELESS 세션 정책 (서버가 세션을 생성하지 않음)
     *        - 공개 URL 및 관리자 URL 접근 제어
     *        - 카카오 OAuth2 로그인 설정
     *        - JWT 인증 필터를 UsernamePasswordAuthenticationFilter 앞에 추가
     *
     * @param http HttpSecurity 객체
     * @return 구성된 SecurityFilterChain
     * @throws Exception 설정 오류 시
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html",
                                "/actuator/health",
                                "/login/oauth2/**", "/oauth2/**",
                                "/files/**", "/uploads/**",
                                "/favicon.ico"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/codes/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(auth -> auth
                                .authorizationRequestRepository(new com.munglog.backend.common.auth.CookieOAuth2AuthorizationRequestRepository()))
                        .redirectionEndpoint(red -> red
                                .baseUri("/login/oauth2/code/*"))
                        .userInfoEndpoint(ui -> ui.userService(customOAuth2UserService))
                        .successHandler(oAuth2SuccessHandler)
                        .failureHandler(oAuth2FailureHandler)
                )
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenProvider, memberRepository),
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    /**
     * [목적] CORS 정책을 설정하여 허용된 오리진의 크로스 도메인 요청을 허용한다.
     * [설명] 쿠키 기반 인증을 위해 allowCredentials=true 필수.
     *        allowedOriginsRaw는 쉼표로 구분된 URL 문자열이며 패턴 매칭을 지원한다.
     *
     * @return CORS 설정 소스
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(allowedOriginsRaw.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
