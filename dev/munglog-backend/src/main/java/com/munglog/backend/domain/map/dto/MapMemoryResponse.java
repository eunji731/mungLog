package com.munglog.backend.domain.map.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 지도 추억 상세 응답 DTO.
 * 지도에 표시할 사진의 GPS 정보, AI 분석 결과, 연결된 순간/일지 정보를 담는 클래스.
 * 주요 기능: 지도 클릭 시 사진 상세 팝업에 사용
 */
@Builder
public record MapMemoryResponse(
        /** 사진의 고유 식별자 */
        UUID photoId,
        /** 원본 사진 파일 경로 또는 URL */
        String path,
        /** 사진 촬영 시각 */
        LocalDateTime takenAt,
        /** 위도 (GPS Latitude) */
        Double latitude,
        /** 경도 (GPS Longitude) */
        Double longitude,
        /** 해당 사진이 속한 순간(Moment) 정보 */
        MemoryInfo moment,
        /** 해당 사진이 속한 일지(Daily Log) 정보 */
        DailyLogInfo dailyLog
) {

    /**
     * 사진이 연결된 순간(Moment) 요약 정보 DTO.
     * 지도 팝업에 표시할 순간의 기본 정보를 담는다.
     */
    @Builder
    public record MemoryInfo(
            /** 순간의 고유 식별자 */
            UUID id,
            /** 활동 카테고리 (예: 산책, 병원 등) */
            String category,
            /** AI가 생성한 순간 제목 */
            String aiTitle,
            /** 장소 이름 */
            String locationName,
            /** AI가 생성한 일기 내용 */
            String aiDiary
    ) {}

    /**
     * 사진이 속한 일지(Daily Log) 요약 정보 DTO.
     * 특정 날짜 일지에 대한 기본 정보를 담는다.
     */
    @Builder
    public record DailyLogInfo(
            /** 일지의 고유 식별자 */
            UUID id,
            /** 일지 날짜 키 (예: "2024-05-01") */
            String dateKey,
            /** AI가 생성한 일지 제목 */
            String aiTitle
    ) {}
}
