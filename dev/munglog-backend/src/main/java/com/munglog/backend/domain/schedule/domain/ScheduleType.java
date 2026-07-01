package com.munglog.backend.domain.schedule.domain;

/**
 * 일정 유형 열거형.
 * 반려동물 돌봄 일정의 종류를 구분한다.
 */
public enum ScheduleType {
    /** 병원 방문 */
    HOSPITAL,
    /** 미용 */
    GROOMING,
    /** 예방접종 */
    VACCINATION,
    /** 건강검진 */
    CHECKUP,
    /** 투약 */
    MEDICINE,
    /** 기타 */
    ETC
}
