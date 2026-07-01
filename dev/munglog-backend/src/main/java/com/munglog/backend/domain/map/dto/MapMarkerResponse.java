package com.munglog.backend.domain.map.dto;

import lombok.Builder;

import java.util.UUID;

/**
 * 지도 마커 응답 DTO.
 * 지도 화면에 표시될 핀(마커)의 위치 및 썸네일 정보를 담는 클래스.
 * 상세 정보를 모두 로드하지 않고 마커 렌더링에 필요한 최소 정보만 포함한다.
 */
@Builder
public record MapMarkerResponse(
        /** 사진의 고유 식별자 */
        UUID id,
        /** 위도 (GPS Latitude) */
        Double lat,
        /** 경도 (GPS Longitude) */
        Double lng,
        /** 마커에 표시할 썸네일 이미지 URL */
        String thumb,
        /** 해당 사진이 속한 순간(Moment)의 UUID */
        UUID momentId,
        /** 일지 날짜 키 (예: "2024-05-01") */
        String dateKey
) {}
