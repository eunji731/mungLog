package com.munglog.backend.domain.inventory.domain;

/**
 * 반려동물 용품 카테고리 열거형.
 * 용품의 종류를 구분하기 위해 사용한다.
 */
public enum ItemCategory {
    /** 사료 (주식) */
    FOOD,
    /** 간식 */
    SNACK,
    /** 장난감 */
    TOY,
    /** 건강·의약품 */
    HEALTH,
    /** 의류·액세서리 */
    CLOTHES,
    /** 기타 */
    ETC
}
