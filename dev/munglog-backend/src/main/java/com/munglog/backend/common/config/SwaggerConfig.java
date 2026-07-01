package com.munglog.backend.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger(SpringDoc OpenAPI) UI 설정 클래스.
 * API 문서 정보와 쿠키 기반 인증 방식(accessToken)을 등록한다.
 * /swagger-ui/index.html에서 API 명세를 확인할 수 있다.
 */
@Configuration
public class SwaggerConfig {

    /**
     * [목적] Swagger UI에 표시할 OpenAPI 명세 객체를 빈으로 등록한다.
     * [설명] 쿠키(accessToken)를 이용한 인증 방식을 보안 스키마로 등록하여
     *        Swagger UI에서 토큰 없이도 인증된 것처럼 테스트할 수 있게 한다.
     *
     * @return OpenAPI 명세 객체
     */
    @Bean
    public OpenAPI openAPI() {
        SecurityScheme cookieAuth = new SecurityScheme()
                .type(SecurityScheme.Type.APIKEY)
                .in(SecurityScheme.In.COOKIE)
                .name("accessToken");

        return new OpenAPI()
                .info(new Info().title("멍로그 API").version("1.0.0").description("멍로그 백엔드 API 문서"))
                .components(new Components().addSecuritySchemes("cookieAuth", cookieAuth))
                .addSecurityItem(new SecurityRequirement().addList("cookieAuth"));
    }
}
