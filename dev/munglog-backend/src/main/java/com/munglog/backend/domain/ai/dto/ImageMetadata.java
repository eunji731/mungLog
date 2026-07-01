package com.munglog.backend.domain.ai.dto;

import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 이미지 파일에서 추출한 EXIF 메타데이터를 담는 DTO.
 * 사진 촬영 일시와 GPS 좌표를 저장하여 AI 분석 및 지도 기능에 활용된다.
 */
@Builder
public record ImageMetadata(
        /** 원본 파일명 */
        String fileName,
        /** EXIF에서 추출한 사진 촬영 일시 (없으면 null) */
        LocalDateTime takenAt,
        /** GPS 위도 좌표 (없으면 null) */
        Double latitude,
        /** GPS 경도 좌표 (없으면 null) */
        Double longitude
) {}
