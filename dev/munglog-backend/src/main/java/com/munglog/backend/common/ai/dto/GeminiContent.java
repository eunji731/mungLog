package com.munglog.backend.common.ai.dto;

import java.util.List;

/**
 * GeminiRequest의 "contents" 배열 안에 들어가는 한 덩어리.
 * 우리 서비스는 항상 parts 하나만 가진 Content 1개만 사용한다.
 */
public record GeminiContent(List<GeminiPart> parts) {
}
