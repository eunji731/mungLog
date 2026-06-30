package com.munglog.backend.domain.family.dto;

import com.munglog.backend.domain.family.domain.FamilyGroup;
import com.munglog.backend.domain.family.domain.GroupRole;

import java.util.List;
import java.util.UUID;

public record FamilyGroupResponse(
        UUID groupId,
        String name,
        String inviteCode,
        GroupRole myRole,
        List<GroupMemberResponse> members
) {
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
