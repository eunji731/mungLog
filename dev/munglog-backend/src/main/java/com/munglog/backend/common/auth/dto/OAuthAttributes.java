package com.munglog.backend.common.auth.dto;

import com.munglog.backend.domain.member.domain.Member;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

/**
 * 카카오 OAuth2 응답에서 사용자 속성을 파싱하는 DTO 클래스.
 * 카카오 API 응답의 중첩된 JSON 구조(kakao_account.profile)를 평탄화(flatten)하여
 * 서비스 계층에서 쉽게 사용할 수 있도록 변환한다.
 */
@Getter
@Builder
public class OAuthAttributes {

    /** 카카오 고유 사용자 ID */
    private Long kakaoId;

    /** 카카오 계정 이메일 */
    private String email;

    /** 카카오 프로필 닉네임 */
    private String nickname;

    /** 카카오 프로필 이미지 URL */
    private String profileImageUrl;

    /**
     * [목적] 카카오 OAuth2 응답 속성 Map을 OAuthAttributes 객체로 변환한다.
     * [설명] 카카오 응답은 attributes → kakao_account → profile 순으로 중첩되어 있다.
     *        각 키가 없을 경우를 대비해 null 처리를 적용한다.
     *
     * @param attributes 카카오 OAuth2 응답의 최상위 속성 Map
     * @return 파싱된 OAuthAttributes 객체
     */
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

    /**
     * [목적] OAuthAttributes 데이터를 기반으로 신규 Member 엔티티를 생성한다.
     *
     * @return 기본 권한(ROLE_USER)이 설정된 신규 Member 엔티티
     */
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
