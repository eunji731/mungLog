package com.munglog.backend.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * AWS S3 클라이언트 설정 클래스.
 * application.yml에서 app.storage.type=s3로 설정한 경우에만 활성화된다.
 * 기본 자격증명 체인(환경변수, EC2 인스턴스 프로파일 등)을 사용하여 S3에 인증한다.
 */
@Configuration
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
public class S3Config {

    /** AWS S3 버킷이 위치한 리전 (예: ap-northeast-2) */
    @Value("${app.s3.region}")
    private String region;

    /**
     * [목적] AWS S3 클라이언트를 빈으로 등록한다.
     * [설명] DefaultCredentialsProvider를 사용하므로 로컬에서는 AWS CLI 인증,
     *        EC2/ECS 환경에서는 IAM 역할로 자동 인증된다.
     *
     * @return 설정된 리전의 S3Client
     */
    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}
