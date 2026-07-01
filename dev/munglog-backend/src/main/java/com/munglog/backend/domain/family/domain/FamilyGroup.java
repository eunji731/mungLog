package com.munglog.backend.domain.family.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 가족 그룹 엔티티.
 * 반려동물 정보, 기억, 스케줄 등을 여러 구성원이 공유하는 단위 그룹을 나타낸다.
 * 각 그룹은 고유한 초대 코드를 가지며, 구성원은 GroupMember를 통해 관리된다.
 * 주요 기능: 그룹 생성, 초대 코드 갱신, 그룹 이름 수정
 */
@Entity
@Table(name = "tb_family_group")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class FamilyGroup extends BaseTimeEntity {

    /** 그룹 고유 식별자 (UUID) */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 그룹 이름 (예: "김민준의 가족") */
    @Column(name = "name", nullable = false)
    private String name;

    /** 신규 구성원 초대에 사용하는 고유 코드 (8자리 대문자+숫자) */
    @Column(name = "invite_code", unique = true, nullable = false, length = 10)
    private String inviteCode;

    /** 그룹에 속한 구성원 목록 */
    @Builder.Default
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupMember> members = new ArrayList<>();

    /**
     * [목적] 초대 코드를 새 값으로 갱신한다.
     * [설명] OWNER가 초대 코드 재발급을 요청할 때 호출된다.
     *
     * @param newCode 새로 생성된 초대 코드 문자열
     */
    public void refreshInviteCode(String newCode) {
        this.inviteCode = newCode;
    }

    /**
     * [목적] 그룹 이름을 수정한다.
     *
     * @param name 변경할 새 그룹 이름
     */
    public void updateName(String name) {
        this.name = name;
    }
}
