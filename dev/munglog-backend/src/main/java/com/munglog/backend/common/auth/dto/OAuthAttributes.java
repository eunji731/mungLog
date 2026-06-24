package com.munglog.backend.common.auth.dto;

import com.munglog.backend.domain.member.domain.Member;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class OAuthAttributes {

    private Long kakaoId;
    private String email;
    private String nickname;
    private String profileImageUrl;

    public static OAuthAttributes ofKakao(Map<String, Object> attributes) {
        Long id = ((Number) attributes.get("id")).longValue();
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        Map<String, Object> profile = kakaoAccount != null
                ? (Map<String, Object>) kakaoAccount.get("profile")
                : Map.of();

        String nickname = profile != null ? (String) profile.get("nickname") : null;
        String profileImageUrl = profile != null ? (String) profile.get("profile_image_url") : null;
        String email = kakaoAccount != null ? (String) kakaoAccount.get("email") : null;

        return OAuthAttributes.builder()
                .kakaoId(id)
                .email(email)
                .nickname(nickname)
                .profileImageUrl(profileImageUrl)
                .build();
    }

    public Member toEntity() {
        return Member.builder()
                .kakaoId(kakaoId)
                .kakaoEmail(email)
                .kakaoNickname(nickname)
                .nickname(nickname)
                .profileImagePath(profileImageUrl)
                .role("ROLE_USER")
                .build();
    }
}
