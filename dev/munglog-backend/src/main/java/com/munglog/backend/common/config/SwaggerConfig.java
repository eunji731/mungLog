package com.munglog.backend.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

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
