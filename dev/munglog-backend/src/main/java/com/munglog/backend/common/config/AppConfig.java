package com.munglog.backend.common.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

/**
 * 애플리케이션 공통 빈(Bean) 설정 클래스.
 * 비밀번호 인코더, JSON 매퍼, HTTP 클라이언트 등 전역에서 공유할 빈을 등록한다.
 */
@Configuration
public class AppConfig {

    /**
     * [목적] BCrypt 알고리즘을 사용하는 비밀번호 인코더를 빈으로 등록한다.
     * [설명] Spring Security 인증 시 비밀번호 해시 비교에 사용된다.
     *
     * @return BCrypt 기반 PasswordEncoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * [목적] Java Time(LocalDate, Instant 등) 직렬화를 지원하는 ObjectMapper를 빈으로 등록한다.
     * [설명] - JavaTimeModule: LocalDate/Instant 등 Java 8 날짜 타입을 JSON으로 변환
     *        - WRITE_DATES_AS_TIMESTAMPS 비활성화: 숫자 타임스탬프 대신 ISO 8601 문자열로 직렬화
     *        - FAIL_ON_UNKNOWN_PROPERTIES 비활성화: JSON에 알 수 없는 필드가 있어도 예외 미발생
     *
     * @return 설정이 적용된 ObjectMapper
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        return mapper;
    }

    /**
     * [목적] 외부 HTTP API(예: Gemini AI)를 호출하는 RestTemplate을 빈으로 등록한다.
     *
     * @return 기본 설정의 RestTemplate
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
