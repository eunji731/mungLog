package com.munglog.backend.domain.category.dto;

import lombok.Getter;

/**
 * 카테고리 생성/수정 요청 DTO.
 * 클라이언트에서 카테고리를 생성하거나 수정할 때 전달하는 데이터를 담는 클래스.
 */
@Getter
public class CategoryRequest {
    /** 카테고리 코드 (예: "HOSPITAL") — 대문자 영문, 공백 없이 전달 */
    private String code;

    /** 화면에 표시할 카테고리 이름 (예: "병원") */
    private String displayName;

    /** 카테고리 아이콘 (이모지 또는 아이콘 코드) */
    private String icon;

    /** 목록 정렬 순서 — null이면 기본값(99) 적용 */
    private Integer sortOrder;
}
