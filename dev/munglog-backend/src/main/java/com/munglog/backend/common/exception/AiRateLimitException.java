package com.munglog.backend.common.exception;

/**
 * AI 분석 횟수 초과 시 발생하는 예외 클래스.
 * GlobalExceptionHandler에서 HTTP 429(Too Many Requests)로 처리된다.
 * 일별 AI 사용량 제한, 날짜별 제한, 대시보드 리포트 재생성 제한 상황에서 사용한다.
 */
public class AiRateLimitException extends RuntimeException {

    /**
     * [목적] 메시지를 직접 지정하여 예외를 생성한다.
     *
     * @param message 사용자에게 보여줄 제한 초과 메시지
     */
    public AiRateLimitException(String message) {
        super(message);
    }

    /**
     * [목적] 특정 날짜의 AI 분석 횟수가 초과된 경우의 예외를 생성한다.
     *
     * @param targetDate 초과된 날짜 문자열 (예: "2025-06-15")
     * @return 날짜 정보가 포함된 예외 객체
     */
    public static AiRateLimitException dateLimitExceeded(String targetDate) {
        return new AiRateLimitException("해당 날짜(" + targetDate + ")의 AI 분석 횟수를 초과했습니다.");
    }

    /**
     * [목적] 오늘의 일별 AI 분석 횟수가 초과된 경우의 예외를 생성한다.
     *
     * @return 일별 한도 초과 예외 객체
     */
    public static AiRateLimitException dailyLimitExceeded() {
        return new AiRateLimitException("오늘의 AI 분석 횟수를 초과했습니다.");
    }

    /**
     * [목적] 오늘의 대시보드 리포트 재생성 횟수가 초과된 경우의 예외를 생성한다.
     *
     * @return 대시보드 재생성 한도 초과 예외 객체
     */
    public static AiRateLimitException dashboardRefreshLimitExceeded() {
        return new AiRateLimitException("오늘의 대시보드 리포트 재생성 횟수를 초과했습니다.");
    }
}
