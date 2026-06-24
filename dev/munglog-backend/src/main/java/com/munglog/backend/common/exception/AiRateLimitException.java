package com.munglog.backend.common.exception;

public class AiRateLimitException extends RuntimeException {

    public AiRateLimitException(String message) {
        super(message);
    }

    public static AiRateLimitException dateLimitExceeded(String targetDate) {
        return new AiRateLimitException("해당 날짜(" + targetDate + ")의 AI 분석 횟수를 초과했습니다.");
    }

    public static AiRateLimitException dailyLimitExceeded() {
        return new AiRateLimitException("오늘의 AI 분석 횟수를 초과했습니다.");
    }

    public static AiRateLimitException dashboardRefreshLimitExceeded() {
        return new AiRateLimitException("오늘의 대시보드 리포트 재생성 횟수를 초과했습니다.");
    }
}
