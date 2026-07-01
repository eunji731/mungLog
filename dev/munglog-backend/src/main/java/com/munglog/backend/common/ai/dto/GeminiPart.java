package com.munglog.backend.common.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 프롬프트 한 조각(part). 다음 두 가지 형태 중 하나로만 사용한다.
 *
 * 1) 텍스트 조각일 때: text에만 값을 채우고 inlineData는 null로 둔다.
 *    예) new GeminiPart("안녕하세요", null)
 *    -> JSON: {"text": "안녕하세요"}
 *
 * 2) 이미지 조각일 때: text는 null로 두고 inlineData에 이미지 정보를 채운다.
 *    예) new GeminiPart(null, new GeminiInlineData("image/jpeg", base64Data))
 *    -> JSON: {"inline_data": {"mime_type": "image/jpeg", "data": "..."}}
 *
 * @JsonInclude(NON_NULL) 덕분에 null인 필드는 JSON 변환 시 자동으로 빠진다.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record GeminiPart(
        String text,
        @JsonProperty("inline_data") GeminiInlineData inlineData
) {
}
