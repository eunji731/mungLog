package com.munglog.backend.domain.member.dto;

import com.munglog.backend.domain.member.domain.Member;
import lombok.Builder;

import java.util.UUID;

/**
 * 회원 정보 응답 DTO.
 * 클라이언트에 반환할 회원 정보를 담는 레코드 클래스.
 * 주요 기능: Member 엔티티를 API 응답 형태로 변환
 */
@Builder
public record MemberResponse(
        /** 회원의 고유 식별자 */
        UUID id,
        /** 카카오 계정 이메일 */
        String kakaoEmail,
        /** 표시용 닉네임 (앱 설정 닉네임 우선, 없으면 카카오 닉네임) */
        String nickname,
        /** 프로필 이미지 접근 URL */
        String profileImageUrl,
        /** AI 다이어리 생성에 활용하는 배경 정보 */
        String aiContext,
        /** 사용자 권한 역할 (예: ROLE_USER, ROLE_ADMIN) */
        String role
) {
    /**
     * [목적] Member 엔티티를 MemberResponse DTO로 변환
     * [설명] 엔티티의 필드를 응답 DTO 형태로 매핑한다.
     *        프로필 이미지 URL은 별도로 계산된 값을 받아 사용한다.
     *
     * @param member          변환할 Member 엔티티
     * @param profileImageUrl 미리 계산된 프로필 이미지 접근 URL
     * @return 변환된 MemberResponse DTO
     */
    public static MemberResponse from(Member member, String profileImageUrl) {
        return MemberResponse.builder()
                .id(member.getId())
                .kakaoEmail(member.getKakaoEmail())
                .nickname(member.getDisplayName())
                .profileImageUrl(profileImageUrl)
                .aiContext(member.getAiContext())
                .role(member.getRole())
                .build();
    }
}
