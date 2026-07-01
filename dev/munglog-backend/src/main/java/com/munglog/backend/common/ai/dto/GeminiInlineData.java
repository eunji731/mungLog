package com.munglog.backend.common.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * GeminiPart가 이미지를 담을 때 사용하는 실제 이미지 데이터.
 *
 * mimeType : 이미지 형식 (예: "image/jpeg")
 * data     : base64로 인코딩된 이미지 내용
 */
public record GeminiInlineData(
        @JsonProperty("mime_type") String mimeType,
        String data
) {
}
