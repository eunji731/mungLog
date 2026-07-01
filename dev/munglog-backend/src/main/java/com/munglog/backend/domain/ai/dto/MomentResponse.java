package com.munglog.backend.domain.ai.dto;

import lombok.Builder;
import java.util.List;
import java.util.UUID;

/**
 * 하루 일지 안의 개별 활동 단위(순간)를 나타내는 DTO.
 * 각 순간은 카테고리, AI 제목·내용, 관련 사진 목록 등을 포함한다.
 */
@Builder
public record MomentResponse(
        /** 활동 카테고리 (예: 산책, 식사, 놀이, 병원) */
        String category,
        /** AI가 생성한 이 순간의 소제목 (반려동물 1인칭) */
        String aiTitle,
        /** AI가 생성한 이 순간의 상세 내용 (반려동물 1인칭) */
        String aiContent,
        /** 이 순간의 에너지 레벨 (예: HIGH, MEDIUM, LOW) */
        String energyLevel,
        /** GPS 또는 사진 분석으로 추론된 장소명 */
        String locationName,
        /** 이 순간을 나타내는 태그 목록 */
        List<String> tags,
        /** 이 순간에 등장한 반려동물 ID 목록 */
        List<UUID> targetPetIds,
        /** 이 순간에 포함된 사진 파일명 목록 (원본 파일명 기준) */
        List<String> photoFileNames,
        /** 이 순간을 대표하는 사진의 저장 경로 */
        String representativePhotoPath,
        /** 각 사진별 AI 분석 상세 정보 (테마태그, 코멘트, 분위기점수 등) */
        List<PhotoDetailResponse> photoDetails
) {}
