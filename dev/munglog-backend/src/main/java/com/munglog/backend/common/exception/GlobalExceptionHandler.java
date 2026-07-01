package com.munglog.backend.common.exception;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.common.file.exception.FileStorageException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 전역 예외 처리 핸들러 클래스.
 * 모든 컨트롤러에서 발생하는 예외를 일관된 ApiResponse 형태로 변환하여 응답한다.
 * 각 예외 타입별로 적절한 HTTP 상태 코드를 반환한다.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * [목적] AI 사용량 초과 예외를 HTTP 429로 처리한다.
     *
     * @param e AI 횟수 초과 예외
     * @return 429 Too Many Requests 응답
     */
    @ExceptionHandler(AiRateLimitException.class)
    public ResponseEntity<ApiResponse<Void>> handleAiRateLimit(AiRateLimitException e) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.error(e.getMessage(), "AI_RATE_LIMIT"));
    }

    /**
     * [목적] 파일 저장/삭제 오류를 HTTP 500으로 처리한다.
     *
     * @param e 파일 저장 예외
     * @return 500 Internal Server Error 응답
     */
    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<ApiResponse<Void>> handleFileStorage(FileStorageException e) {
        log.error("파일 저장 오류", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("파일 처리 중 오류가 발생했습니다.", "FILE_ERROR"));
    }

    /**
     * [목적] 잘못된 요청 파라미터 예외를 HTTP 400으로 처리한다.
     * [설명] 존재하지 않는 리소스 조회, 유효하지 않은 값 입력 등에서 발생한다.
     *
     * @param e 잘못된 인자 예외
     * @return 400 Bad Request 응답
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage(), "BAD_REQUEST"));
    }

    /**
     * [목적] 권한 없는 접근 예외를 HTTP 403으로 처리한다.
     *
     * @param e 보안 예외
     * @return 403 Forbidden 응답
     */
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ApiResponse<Void>> handleSecurity(SecurityException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(e.getMessage(), "FORBIDDEN"));
    }

    /**
     * [목적] 처리되지 않은 모든 예외를 HTTP 500으로 처리한다.
     * [설명] 위 핸들러에서 처리되지 않은 예외의 최후 방어선 역할을 한다.
     *        에러 로그를 남겨 운영 시 추적할 수 있도록 한다.
     *
     * @param e 처리되지 않은 예외
     * @return 500 Internal Server Error 응답
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("처리되지 않은 예외", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("서버 오류가 발생했습니다.", "INTERNAL_ERROR"));
    }
}
