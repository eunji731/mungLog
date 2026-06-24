package com.munglog.backend.domain.member.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tb_member")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Member extends BaseTimeEntity {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "kakao_id", unique = true)
    private Long kakaoId;

    @Column(name = "kakao_email")
    private String kakaoEmail;

    @Column(name = "kakao_nickname")
    private String kakaoNickname;

    @Column(name = "nickname")
    private String nickname;

    @Column(name = "profile_image_path")
    private String profileImagePath;

    @Column(name = "refresh_token_hash")
    private String refreshTokenHash;

    @Column(name = "token_issued_at")
    private Instant tokenIssuedAt;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "role", nullable = false)
    private String role = "ROLE_USER";

    @Column(name = "ai_context", columnDefinition = "TEXT")
    private String aiContext;

    public void update(String kakaoNickname, String profileImagePath) {
        this.kakaoNickname = kakaoNickname;
        if (profileImagePath != null) {
            this.profileImagePath = profileImagePath;
        }
    }

    public void updateProfile(String nickname, String profileImagePath) {
        if (nickname != null) this.nickname = nickname;
        if (profileImagePath != null) this.profileImagePath = profileImagePath;
    }

    public void updateRefreshToken(String refreshTokenHash) {
        this.refreshTokenHash = refreshTokenHash;
        this.tokenIssuedAt = Instant.now();
    }

    public void invalidateToken() {
        this.refreshTokenHash = null;
        this.tokenIssuedAt = null;
    }

    public void withdraw() {
        this.isActive = false;
        this.refreshTokenHash = null;
        this.tokenIssuedAt = null;
    }

    public void reactivate() {
        this.isActive = true;
    }

    public String getDisplayName() {
        return nickname != null ? nickname : kakaoNickname;
    }
}
