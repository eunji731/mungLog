package com.munglog.backend.domain.member.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

/**
 * 회원 엔티티.
 * 카카오 OAuth2로 가입한 사용자의 정보를 저장하는 JPA 엔티티 클래스.
 * 주요 기능: 프로필 관리, 토큰 관리, 탈퇴/재가입 처리, AI 컨텍스트 관리
 */
@Entity // 이 클래스는 JPA 엔티티라는 뜻
@Table(name = "tb_member") // 이 엔티티가 연결될 테이블 이름을 지정
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 기본 생성자, 파라미터 없는 생성자를 자동으로 만들어주는 롬복 어노테이션
// protected로 막아둔 이유 : 아무 정보 없는 회원 객체를 막 만들지 못하게 하려고
@AllArgsConstructor // 모든 필드를 파라미터로 받는 생성자를 자동으로 만들어주는 롬복 어노테이션
@Builder // 객체 만들 때 생성자 대신 .필드명(값) 형태로 조립해서 만들게 해주는 롬복 어노테이션
public class Member extends BaseTimeEntity {

    /** 회원의 고유 식별자 (UUID 자동 생성) */
    @Id
    @UuidGenerator // UUID 값을 자동 생성해주는 Hibernate 어노테이션
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 카카오 로그인 고유 ID (유니크) */
    @Column(name = "kakao_id", unique = true)
    private Long kakaoId;

    /** 카카오 계정 이메일 */
    @Column(name = "kakao_email")
    private String kakaoEmail;

    /** 카카오 프로필 닉네임 */
    @Column(name = "kakao_nickname")
    private String kakaoNickname;

    /** 앱 내 사용자 설정 닉네임 (null이면 kakaoNickname을 사용) */
    @Column(name = "nickname")
    private String nickname;

    /** 프로필 이미지 파일 저장 경로 */
    @Column(name = "profile_image_path")
    private String profileImagePath;

    /** Refresh Token의 해시값 (보안을 위해 원문 대신 해시 저장) */
    @Column(name = "refresh_token_hash")
    private String refreshTokenHash;

    /** Refresh Token이 마지막으로 발급된 시각 */
    @Column(name = "token_issued_at")
    private Instant tokenIssuedAt;

    /** 계정 활성화 여부 (탈퇴 시 false로 변경) */
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /** 사용자 권한 역할 (기본값: ROLE_USER) */
    @Builder.Default
    @Column(name = "role", nullable = false)
    private String role = "ROLE_USER";

    /** AI 다이어리 생성 시 참고할 사용자 배경 정보 (가족 구성, 반려동물 특징 등) */
    @Column(name = "ai_context", columnDefinition = "TEXT")
    private String aiContext;

    /** 마지막으로 공지사항을 확인한 시각 (미확인 공지 배지 계산에 사용) */
    @Column(name = "last_notice_read_at")
    private Instant lastNoticeReadAt;

    /**
     * [목적] 공지사항 읽음 처리
     * [설명] 현재 시각을 lastNoticeReadAt에 기록하여 이후 공지는 읽지 않은 상태로 표시된다.
     */
    public void markNoticesRead() {
        this.lastNoticeReadAt = Instant.now();
    }

    /**
     * [목적] 카카오 OAuth2 로그인 시 회원 정보를 최신화
     * [설명] 카카오에서 가져온 닉네임과 프로필 이미지를 업데이트한다.
     *        profileImagePath는 null이 아닌 경우에만 업데이트한다.
     *
     * @param kakaoNickname    카카오 프로필 닉네임
     * @param profileImagePath 카카오 프로필 이미지 경로 (null이면 기존 값 유지)
     */
    public void update(String kakaoNickname, String profileImagePath) {
        this.kakaoNickname = kakaoNickname;
        if (profileImagePath != null) {
            this.profileImagePath = profileImagePath;
        }
    }

    /**
     * [목적] 사용자가 직접 앱 내에서 프로필을 수정
     * [설명] 닉네임과 프로필 이미지 경로를 업데이트한다.
     *        각 값이 null이면 기존 값을 유지한다.
     *
     * @param nickname         변경할 닉네임 (null이면 기존 값 유지)
     * @param profileImagePath 변경할 프로필 이미지 경로 (null이면 기존 값 유지)
     */
    public void updateProfile(String nickname, String profileImagePath) {
        if (nickname != null) this.nickname = nickname;
        if (profileImagePath != null) this.profileImagePath = profileImagePath;
    }

    /**
     * [목적] AI 다이어리 생성에 활용할 배경 정보를 저장
     * [설명] 사용자가 입력한 AI 컨텍스트(반려동물 특성, 가족 정보 등)를 업데이트한다.
     *
     * @param aiContext AI 생성 시 참고할 배경 정보 문자열
     */
    public void updateAiContext(String aiContext) {
        this.aiContext = aiContext;
    }

    /**
     * [목적] Refresh Token을 갱신
     * [설명] 새로 발급된 Refresh Token의 해시값과 발급 시각을 저장한다.
     *
     * @param refreshTokenHash 새로 발급된 Refresh Token의 해시값
     */
    public void updateRefreshToken(String refreshTokenHash) {
        this.refreshTokenHash = refreshTokenHash;
        this.tokenIssuedAt = Instant.now();
    }

    /**
     * [목적] Refresh Token을 무효화하여 강제 로그아웃 처리
     * [설명] refreshTokenHash와 tokenIssuedAt을 null로 설정하여 토큰 검증이 실패하도록 한다.
     *        로그아웃 또는 보안 이슈 발생 시 사용한다.
     */
    public void invalidateToken() {
        this.refreshTokenHash = null;
        this.tokenIssuedAt = null;
    }

    /**
     * [목적] 회원 탈퇴 처리
     * [설명] 계정을 비활성화하고 토큰을 무효화한다.
     *        isActive가 false이면 로그인이 불가하다.
     */
    public void withdraw() {
        this.isActive = false;
        this.refreshTokenHash = null;
        this.tokenIssuedAt = null;
    }

    /**
     * [목적] 탈퇴한 계정을 다시 활성화 (재가입)
     * [설명] isActive를 true로 변경하여 로그인을 허용한다.
     */
    public void reactivate() {
        this.isActive = true;
    }

    /**
     * [목적] 화면에 표시할 닉네임을 반환
     * [설명] 앱에서 설정한 닉네임이 있으면 그것을, 없으면 카카오 닉네임을 반환한다.
     *
     * @return 표시용 닉네임 (nickname 우선, 없으면 kakaoNickname)
     */
    public String getDisplayName() {
        return nickname != null ? nickname : kakaoNickname;
    }
}
