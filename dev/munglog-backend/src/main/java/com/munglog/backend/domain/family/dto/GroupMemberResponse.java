package com.munglog.backend.domain.family.dto;

import com.munglog.backend.domain.family.domain.GroupMember;
import com.munglog.backend.domain.family.domain.GroupRole;

import java.util.UUID;

/**
 * 가족 그룹 구성원 응답 DTO.
 * 구성원의 사용자 ID, 닉네임, 프로필 이미지 URL, 역할 정보를 포함한다.
 */
public record GroupMemberResponse(
        /** 구성원 사용자 UUID */
        UUID userId,
        /** 구성원 닉네임(표시 이름) */
        String nickname,
        /** 구성원 프로필 이미지 URL */
        String profileImageUrl,
        /** 그룹 내 역할 (OWNER 또는 MEMBER) */
        GroupRole role
) {
    /**
     * [목적] GroupMember 엔티티로부터 응답 DTO를 생성한다.
     *
     * @param gm GroupMember 엔티티
     * @return GroupMemberResponse 인스턴스
     */
    public static GroupMemberResponse from(GroupMember gm) {
        return new GroupMemberResponse(
                gm.getMember().getId(),
                gm.getMember().getDisplayName(),
                gm.getMember().getProfileImagePath(),
                gm.getRole()
        );
    }
}
