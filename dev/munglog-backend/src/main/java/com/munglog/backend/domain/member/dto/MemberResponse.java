package com.munglog.backend.domain.member.dto;

import com.munglog.backend.domain.member.domain.Member;
import lombok.Builder;

import java.util.UUID;

@Builder
public record MemberResponse(
        UUID id,
        String kakaoEmail,
        String nickname,
        String profileImageUrl,
        String aiContext
) {
    public static MemberResponse from(Member member, String profileImageUrl) {
        return MemberResponse.builder()
                .id(member.getId())
                .kakaoEmail(member.getKakaoEmail())
                .nickname(member.getDisplayName())
                .profileImageUrl(profileImageUrl)
                .aiContext(member.getAiContext())
                .build();
    }
}
