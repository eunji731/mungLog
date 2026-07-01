package com.munglog.backend.domain.member.dto;

/**
 * 회원 정보 수정 요청 DTO.
 * 사용자가 프로필 수정 시 전달하는 데이터를 담는 레코드 클래스.
 */
public record MemberUpdateRequest(
        /** 변경할 닉네임 (null이면 기존 닉네임 유지) */
        String nickname
) {
}
