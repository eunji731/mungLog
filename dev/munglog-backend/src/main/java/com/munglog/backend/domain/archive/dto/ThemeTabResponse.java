package com.munglog.backend.domain.archive.dto;

import lombok.Builder;

/**
 * 테마 탭 응답 DTO.
 * 아카이브 화면에서 테마별 탭을 표시할 때 사용하는 레코드 클래스.
 * 태그명, 해당 태그가 붙은 사진 수, 대표 사진 URL을 포함한다.
 */
@Builder
public record ThemeTabResponse(
        /** 테마 태그명 (예: "산책", "생일") */
        String tag,
        /** 해당 태그가 붙은 사진 수 */
        long count,
        /** 탭 대표 사진 URL (썸네일 우선, 없으면 원본) */
        String representativePhotoUrl
) {}
