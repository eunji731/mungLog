package com.munglog.backend.domain.category.dto;

import com.munglog.backend.domain.category.domain.CareCategory;
import com.munglog.backend.domain.category.domain.ScheduleCategory;

/**
 * 카테고리 응답 DTO.
 * 케어 카테고리 또는 일정 카테고리를 클라이언트에 반환할 때 사용하는 레코드 클래스.
 * CareCategory와 ScheduleCategory 모두 동일한 응답 형식을 공유한다.
 *
 * @param id        카테고리 고유 식별자
 * @param code      카테고리 코드
 * @param displayName 화면 표시명
 * @param icon      아이콘
 * @param sortOrder 정렬 순서
 * @param isSystem  시스템 제공 여부
 */
public record CategoryResponse(
        Long id,
        String code,
        String displayName,
        String icon,
        Integer sortOrder,
        Boolean isSystem
) {
    /**
     * [목적] CareCategory 엔티티를 CategoryResponse로 변환한다.
     * [설명] 엔티티의 필드를 응답 레코드에 그대로 매핑한다.
     *
     * @param c 변환할 CareCategory 엔티티
     * @return CategoryResponse 응답 객체
     */
    public static CategoryResponse from(CareCategory c) {
        return new CategoryResponse(c.getId(), c.getCode(), c.getDisplayName(), c.getIcon(), c.getSortOrder(), c.getIsSystem());
    }

    /**
     * [목적] ScheduleCategory 엔티티를 CategoryResponse로 변환한다.
     * [설명] 엔티티의 필드를 응답 레코드에 그대로 매핑한다.
     *
     * @param c 변환할 ScheduleCategory 엔티티
     * @return CategoryResponse 응답 객체
     */
    public static CategoryResponse from(ScheduleCategory c) {
        return new CategoryResponse(c.getId(), c.getCode(), c.getDisplayName(), c.getIcon(), c.getSortOrder(), c.getIsSystem());
    }
}
