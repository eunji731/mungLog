package com.munglog.backend.common.domain.code;

/**
 * 공통 코드의 분류 타입을 나타내는 열거형.
 * 코드 테이블(tb_code)에서 같은 타입끼리 그룹 조회할 때 사용한다.
 */
public enum CodeType {
    /** 사용자 권한 코드 (예: ROLE_USER, ROLE_ADMIN) */
    ROLE
}
