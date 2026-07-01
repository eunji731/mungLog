package com.munglog.backend.common.id;

/**
 * IdGenerator에서 사용하는 ID 접두사 상수 클래스.
 * 각 도메인 엔티티의 ID를 한눈에 구분할 수 있도록 의미있는 접두사를 부여한다.
 * 예: "COD00000000001" → 공통 코드 ID
 */
public class IdPrefix {
    /** 공통 코드(Code) ID 접두사 */
    public static final String CODE = "COD";

    /** 회원(Member) ID 접두사 */
    public static final String MEMBER = "USR";

    /** 반려동물(Pet) ID 접두사 */
    public static final String PET = "PET";

    /** AI 일기(Diary) ID 접두사 */
    public static final String DIARY = "DRY";
}
