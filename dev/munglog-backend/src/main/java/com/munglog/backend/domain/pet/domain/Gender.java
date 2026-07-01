package com.munglog.backend.domain.pet.domain;

/**
 * 반려동물 성별 열거형.
 * 반려동물의 성별 정보를 나타내며 중성화와 무관하게 생물학적 성별을 기준으로 선택한다.
 */
public enum Gender {
    /** 수컷 */
    MALE,
    /** 암컷 */
    FEMALE,
    /** 성별 미상 또는 미등록 */
    UNKNOWN
}
