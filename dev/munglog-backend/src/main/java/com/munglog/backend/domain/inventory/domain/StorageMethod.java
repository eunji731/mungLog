package com.munglog.backend.domain.inventory.domain;

/**
 * 용품 보관 방법 열거형.
 * 사료·간식 등 용품의 보관 방법을 나타낸다.
 */
public enum StorageMethod {
    /** 실온 보관 */
    ROOM_TEMP,
    /** 냉장 보관 */
    REFRIGERATED,
    /** 냉동 보관 */
    FROZEN
}
