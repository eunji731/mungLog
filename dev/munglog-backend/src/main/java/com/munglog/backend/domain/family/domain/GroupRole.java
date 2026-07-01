package com.munglog.backend.domain.family.domain;

/**
 * 가족 그룹 내 구성원 역할 열거형.
 * OWNER는 그룹 관리 권한(초대 코드 변경, 이름 수정, 소유권 위임 등)을 가지며,
 * MEMBER는 데이터 조회·입력만 가능하다.
 */
public enum GroupRole {
    /** 그룹 관리자 (초대 코드 변경, 그룹명 수정, 소유권 위임 가능) */
    OWNER,

    /** 일반 구성원 (데이터 조회·입력만 가능) */
    MEMBER
}
