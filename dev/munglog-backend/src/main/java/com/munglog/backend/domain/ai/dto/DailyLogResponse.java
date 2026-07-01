package com.munglog.backend.domain.ai.dto;

import lombok.Builder;
import java.util.List;

/**
 * Gemini AI가 생성한 하루치 반려동물 일지 전체를 담는 DTO.
 * 일지 제목·요약과 함께 시간순으로 구성된 순간(Moment) 목록을 포함한다.
 */
@Builder
public record DailyLogResponse(
        /** AI가 생성한 일지 전체 제목 (반려동물 1인칭) */
        String aiTitle,
        /** AI가 생성한 하루 일지 요약 (반려동물 1인칭) */
        String aiSummary,
        /** 이 일지를 대표하는 사진의 저장 경로 */
        String representativePhotoPath,
        /** 하루를 구성하는 순간(활동 단위) 목록 */
        List<MomentResponse> moments
) {}
