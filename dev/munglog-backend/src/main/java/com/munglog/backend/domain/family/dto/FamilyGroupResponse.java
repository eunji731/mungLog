package com.munglog.backend.domain.family.dto;

import com.munglog.backend.domain.family.domain.FamilyGroup;
import com.munglog.backend.domain.family.domain.GroupRole;

import java.util.List;
import java.util.UUID;

/**
 * 가족 그룹 응답 DTO.
 * 그룹 기본 정보(ID, 이름, 초대 코드), 현재 사용자의 역할, 전체 구성원 목록을 포함한다.
 */
public record FamilyGroupResponse(
        /** 그룹 UUID */
        UUID groupId,
        /** 그룹 이름 */
        String name,
        /** 현재 유효한 초대 코드 */
        String inviteCode,
        /** 요청한 사용자의 그룹 내 역할 */
        GroupRole myRole,
        /** 그룹 전체 구성원 목록 */
        List<GroupMemberResponse> members
) {
    /**
     * [목적] FamilyGroup 엔티티와 역할 정보로 응답 DTO를 생성한다.
     *
     * @param group   가족 그룹 엔티티
     * @param myRole  요청한 사용자의 역할
     * @param members 전체 구성원 응답 목록
     * @return FamilyGroupResponse 인스턴스
     */
    public static FamilyGroupResponse of(FamilyGroup group, GroupRole myRole, List<GroupMemberResponse> members) {
        return new FamilyGroupResponse(
                group.getId(),
                group.getName(),
                group.getInviteCode(),
                myRole,
                members
        );
    }
}
