package com.munglog.backend.domain.ai.dto;

import java.util.UUID;

/**
 * AI 일지 분석 시 전달하는 반려동물 식별 정보 DTO.
 * 분석 대상 반려동물을 특정하고, AI 프롬프트에 이름을 포함시키기 위해 사용된다.
 *
 * @param id   반려동물 고유 ID (DB 조회에 사용)
 * @param name 반려동물 이름 (AI 프롬프트에 직접 포함)
 */
public record PetInfoRequest(UUID id, String name) {}
