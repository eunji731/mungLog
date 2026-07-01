package com.munglog.backend.common.file.domain;

/**
 * 첨부파일이 속한 도메인 타입을 나타내는 열거형.
 * AttachedFile 엔티티가 어떤 도메인에 연결된 파일인지 구분하는 데 사용한다.
 */
public enum ParentDomainType {
    /** 메모리(추억) 사진 */
    MEMORY,

    /** AI 일기 사진 */
    DIARY,

    /** 기타 기록 파일 */
    RECORD,

    /** 반려동물 프로필 사진 */
    PET_PROFILE,

    /** 반려동물 관련 문서 (건강기록 등) */
    PET_DOC,

    /** 회원 프로필 사진 */
    MEMBER_PROFILE,

    /** 반려동물 용품 인벤토리 이미지 */
    INVENTORY,

    /** 케어 기록 첨부파일 */
    CARE,

    /** 일정 첨부파일 */
    SCHEDULE,

    /** 증상 스냅 첨부파일 */
    SYMPTOM_SNAP
}
