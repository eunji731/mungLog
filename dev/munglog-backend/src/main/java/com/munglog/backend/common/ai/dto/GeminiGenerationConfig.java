package com.munglog.backend.common.ai.dto;

/**
 * AI 응답 생성 방식을 조절하는 옵션.
 *
 * temperature     : 값이 높을수록 답변이 더 다양하고 창의적으로 나온다 (0~1)
 * maxOutputTokens : AI가 생성할 수 있는 최대 응답 길이
 */
public record GeminiGenerationConfig(
        double temperature,
        int maxOutputTokens
) {
}
