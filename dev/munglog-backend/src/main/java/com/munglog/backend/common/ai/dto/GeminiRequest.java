package com.munglog.backend.common.ai.dto;

import java.util.List;

/**
 * Gemini API에 보내는 요청 전체를 표현하는 객체.
 *
 * 실제로 전송되는 JSON 모양은 다음과 같다.
 * {
 *   "contents": [ { "parts": [ ... ] } ],
 *   "generationConfig": { "temperature": 0.7, "maxOutputTokens": 8192 }
 * }
 */
public record GeminiRequest(
        List<GeminiContent> contents,
        GeminiGenerationConfig generationConfig
) {
}
