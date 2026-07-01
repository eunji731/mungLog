package com.munglog.backend.domain.family.domain;

import com.munglog.backend.domain.member.domain.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 가족 그룹 구성원 엔티티.
 * FamilyGroup과 Member 사이의 다대다 관계를 해소하는 연결 테이블 역할을 한다.
 * 각 구성원은 OWNER(관리자) 또는 MEMBER(일반) 역할을 가진다.
 * 주요 기능: 구성원 역할 변경, 가입 시각 기록
 */
@Entity
@Table(name = "tb_group_member")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class GroupMember {

    /** 복합 기본키 (groupId + userId) */
    @EmbeddedId
    private GroupMemberId id;

    /** 소속 가족 그룹 */
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("groupId")
    @JoinColumn(name = "group_id")
    private FamilyGroup group;

    /** 구성원 회원 정보 */
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private Member member;

    /** 그룹 내 역할 (OWNER 또는 MEMBER) */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private GroupRole role;

    /** 그룹 가입 시각 */
    @Builder.Default
    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    /**
     * [목적] 구성원의 역할을 변경한다.
     * [설명] 소유권 위임(OWNER→MEMBER, MEMBER→OWNER) 시 호출된다.
     *
     * @param newRole 변경할 새 역할
     */
    public void changeRole(GroupRole newRole) {
        this.role = newRole;
    }
}
