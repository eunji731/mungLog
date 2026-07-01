package com.munglog.backend.domain.ai.dto;

import lombok.Builder;

/**
 * 이미지 파일의 EXIF 메타데이터 포함 여부를 나타내는 응답 DTO.
 * AI 분석 전 사전 체크 단계에서 사용되며, 날짜·GPS 정보 유무를 클라이언트에 알린다.
 */
@Builder
public record CheckMetadataResponse(
        /** 원본 파일명 */
        String originalName,
        /** 촬영 일시(EXIF) 포함 여부 (true이면 날짜 정보 활용 가능) */
        boolean hasDate,
        /** GPS 좌표(EXIF) 포함 여부 (true이면 위치 기반 장소명 추론 가능) */
        boolean hasGps
) {}
