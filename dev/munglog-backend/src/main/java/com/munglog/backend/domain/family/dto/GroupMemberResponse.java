package com.munglog.backend.domain.family.dto;

import com.munglog.backend.domain.family.domain.GroupMember;
import com.munglog.backend.domain.family.domain.GroupRole;

import java.util.UUID;

public record GroupMemberResponse(
        UUID userId,
        String nickname,
        String profileImageUrl,
        GroupRole role
) {
    public static GroupMemberResponse from(GroupMember gm) {
        return new GroupMemberResponse(
                gm.getMember().getId(),
                gm.getMember().getDisplayName(),
                gm.getMember().getProfileImagePath(),
                gm.getRole()
        );
    }
}
