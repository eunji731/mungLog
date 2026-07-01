package com.munglog.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 멍로그 백엔드 애플리케이션 진입점.
 * JPA Auditing(createdAt/updatedAt 자동 주입)과 스케줄러(@Scheduled)를 활성화한다.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class MunglogBackendApplication {

    /**
     * [목적] 스프링 부트 애플리케이션을 시작한다.
     *
     * @param args 커맨드라인 인수
     */
    public static void main(String[] args) {
        SpringApplication.run(MunglogBackendApplication.class, args);
    }
}
