package com.munglog.backend.domain.care.domain;

/**
 * 케어 기록 유형 열거형.
 * 반려동물 케어 기록을 분류하는 타입을 정의한다.
 */
public enum CareRecordType {
    /** 병원 방문 기록 */
    HOSPITAL,
    /** 투약 기록 */
    MEDICINE,
    /** 미용 기록 */
    GROOMING,
    /** 예방접종 기록 */
    VACCINATION,
    /** 건강검진 기록 */
    CHECKUP,
    /** 지출 기록 */
    EXPENSE,
    /** 기타 케어 기록 */
    ETC
}
