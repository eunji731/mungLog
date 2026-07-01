package com.munglog.backend.domain.ai.dto;

import lombok.Builder;
import java.util.List;

/**
 * AI가 개별 사진을 분석한 결과를 담는 DTO.
 * 사진별 테마 태그, 감성 코멘트, 분위기 점수, 대표 사진 여부를 포함한다.
 */
@Builder
public record PhotoDetailResponse(
        /** 분석 대상 사진의 원본 파일명 */
        String fileName,
        /** AI가 사진 내용 기반으로 붙인 테마 태그 목록 (예: 산책, 공원, 간식) */
        List<String> themeTags,
        /** AI가 사진 한 장에 대해 작성한 감성 한 줄 코멘트 */
        String photoComment,
        /** 사진의 밝고 행복한 분위기 점수 (1~10, 높을수록 긍정적) */
        Integer vibeScore,
        /** 이 순간(Moment)의 대표 사진 여부 (한 순간에 하나만 true) */
        Boolean isBest
) {}
