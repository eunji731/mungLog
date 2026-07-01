package com.munglog.backend.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring MVC 웹 설정 클래스.
 * 로컬 파일 시스템에 저장된 업로드 파일을 HTTP로 서빙하는 정적 리소스 핸들러를 등록한다.
 * S3 환경에서는 이 설정이 무의미하며, 로컬(local) 스토리지 환경에서만 사용된다.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /** 업로드 파일이 저장된 로컬 기본 경로 (application.yml: app.upload.base-path) */
    @Value("${app.upload.base-path}")
    private String uploadBasePath;

    /**
     * [목적] 로컬 디스크의 업로드 파일을 URL 경로로 접근할 수 있도록 정적 리소스를 매핑한다.
     * [설명] - /uploads/** → {uploadBasePath}/
     *        - /files/**   → {uploadBasePath}/files/
     *        예: /files/pet_profile/xxx.jpg → 실제 파일 시스템 경로로 매핑
     *
     * @param registry 리소스 핸들러 레지스트리
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadBasePath + "/");
        registry.addResourceHandler("/files/**")
                .addResourceLocations("file:" + uploadBasePath + "/files/");
    }
}
