package com.munglog.backend.domain.family.service;

import com.munglog.backend.domain.family.domain.FamilyGroup;
import com.munglog.backend.domain.family.domain.GroupMember;
import com.munglog.backend.domain.family.domain.GroupMemberId;
import com.munglog.backend.domain.family.domain.GroupRole;
import com.munglog.backend.domain.family.dto.FamilyGroupResponse;
import com.munglog.backend.domain.family.dto.GroupMemberResponse;
import com.munglog.backend.domain.family.repository.FamilyGroupRepository;
import com.munglog.backend.domain.family.repository.GroupMemberRepository;
import com.munglog.backend.domain.inventory.repository.InventoryItemRepository;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import com.munglog.backend.domain.memory.repository.MemoryRepository;
import com.munglog.backend.domain.pet.repository.PetRepository;
import com.munglog.backend.domain.vaccination.repository.VaccinationTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FamilyGroupService {

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 8;
    private final SecureRandom random = new SecureRandom();

    private final FamilyGroupRepository familyGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final MemberRepository memberRepository;
    private final PetRepository petRepository;
    private final MemoryRepository memoryRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final VaccinationTypeRepository vaccinationTypeRepository;
    private final GroupDataCleanupService groupDataCleanupService;

    @Transactional
    public FamilyGroupResponse createGroup(UUID userId, String name) {
        if (groupMemberRepository.findByUserId(userId).isPresent()) {
            throw new IllegalStateException("이미 가족 그룹에 속해 있습니다. 탈퇴 후 새 그룹을 생성하세요.");
        }
        Member member = findMember(userId);
        FamilyGroup group = familyGroupRepository.save(
                FamilyGroup.builder()
                        .name(name != null && !name.isBlank() ? name : member.getDisplayName() + "의 가족")
                        .inviteCode(generateUniqueCode())
                        .build()
        );
        joinAsOwner(group, member);
        return buildResponse(group, GroupRole.OWNER, userId);
    }

    @Transactional
    public FamilyGroupResponse createGroupForNewMember(Member member) {
        FamilyGroup group = familyGroupRepository.save(
                FamilyGroup.builder()
                        .name(member.getDisplayName() + "의 가족")
                        .inviteCode(generateUniqueCode())
                        .build()
        );
        joinAsOwner(group, member);
        return buildResponse(group, GroupRole.OWNER, member.getId());
    }

    @Transactional
    public FamilyGroupResponse joinGroup(UUID userId, String inviteCode) {
        FamilyGroup targetGroup = familyGroupRepository.findByInviteCode(inviteCode.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대 코드입니다."));
        Member member = findMember(userId);

        GroupMember existing = groupMemberRepository.findByUserId(userId).orElse(null);
        if (existing != null) {
            UUID currentGroupId = existing.getGroup().getId();
            if (currentGroupId.equals(targetGroup.getId())) {
                throw new IllegalStateException("이미 해당 가족 그룹에 속해 있습니다.");
            }
            long memberCount = groupMemberRepository.countByGroupId(currentGroupId);
            if (memberCount > 1) {
                throw new IllegalStateException("다른 구성원이 있는 그룹은 먼저 탈퇴해야 합니다. 관리자라면 위임 후 탈퇴하세요.");
            }
            // 개인 그룹(1인) → 데이터를 가족 그룹으로 이전 후 개인 그룹 삭제
            mergeGroupData(currentGroupId, targetGroup.getId());
            groupMemberRepository.delete(existing);
            if (groupMemberRepository.countByGroupId(currentGroupId) == 0) {
                familyGroupRepository.deleteById(currentGroupId);
            }
        }

        GroupMember gm = GroupMember.builder()
                .id(new GroupMemberId(targetGroup.getId(), userId))
                .group(targetGroup)
                .member(member)
                .role(GroupRole.MEMBER)
                .build();
        groupMemberRepository.save(gm);

        return buildResponse(targetGroup, GroupRole.MEMBER, userId);
    }

    private void mergeGroupData(UUID sourceGroupId, UUID targetGroupId) {
        petRepository.bulkMoveToGroup(sourceGroupId, targetGroupId);
        memoryRepository.bulkMoveToGroup(sourceGroupId, targetGroupId);
        inventoryItemRepository.bulkMoveToGroup(sourceGroupId, targetGroupId);
        vaccinationTypeRepository.bulkMoveToGroup(sourceGroupId, targetGroupId);
    }

    @Transactional(readOnly = true)
    public FamilyGroupResponse getMyGroup(UUID userId) {
        GroupMember gm = groupMemberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("소속된 가족 그룹이 없습니다."));
        return buildResponse(gm.getGroup(), gm.getRole(), userId);
    }

    @Transactional
    public String refreshInviteCode(UUID userId) {
        GroupMember gm = groupMemberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("소속된 가족 그룹이 없습니다."));
        if (gm.getRole() != GroupRole.OWNER) {
            throw new IllegalStateException("초대 코드는 그룹 관리자만 변경할 수 있습니다.");
        }
        String newCode = generateUniqueCode();
        gm.getGroup().refreshInviteCode(newCode);
        familyGroupRepository.save(gm.getGroup());
        return newCode;
    }

    @Transactional
    public FamilyGroupResponse updateGroupName(UUID userId, String name) {
        GroupMember gm = groupMemberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("소속된 가족 그룹이 없습니다."));
        if (gm.getRole() != GroupRole.OWNER) {
            throw new IllegalStateException("그룹 이름은 관리자만 변경할 수 있습니다.");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("그룹 이름을 입력해주세요.");
        }
        gm.getGroup().updateName(name.trim());
        familyGroupRepository.save(gm.getGroup());
        return buildResponse(gm.getGroup(), gm.getRole(), userId);
    }

    @Transactional
    public FamilyGroupResponse transferOwnership(UUID userId, UUID newOwnerUserId) {
        GroupMember currentOwner = groupMemberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("소속된 가족 그룹이 없습니다."));
        if (currentOwner.getRole() != GroupRole.OWNER) {
            throw new IllegalStateException("그룹 관리자만 소유권을 위임할 수 있습니다.");
        }
        if (userId.equals(newOwnerUserId)) {
            throw new IllegalArgumentException("자기 자신에게 위임할 수 없습니다.");
        }

        UUID groupId = currentOwner.getGroup().getId();
        GroupMember newOwner = groupMemberRepository.findAllByGroupId(groupId).stream()
                .filter(gm -> gm.getMember().getId().equals(newOwnerUserId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("해당 구성원을 찾을 수 없습니다."));

        currentOwner.changeRole(GroupRole.MEMBER);
        newOwner.changeRole(GroupRole.OWNER);
        groupMemberRepository.save(currentOwner);
        groupMemberRepository.save(newOwner);

        return buildResponse(currentOwner.getGroup(), GroupRole.MEMBER, userId);
    }

    @Transactional
    public FamilyGroupResponse leaveGroup(UUID userId) {
        GroupMember gm = groupMemberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("소속된 가족 그룹이 없습니다."));

        if (gm.getRole() == GroupRole.OWNER && groupMemberRepository.countByGroupId(gm.getGroup().getId()) > 1) {
            throw new IllegalStateException("다른 구성원이 있는 경우 관리자는 탈퇴할 수 없습니다. 관리자를 먼저 위임하세요.");
        }

        UUID oldGroupId = gm.getGroup().getId();
        boolean isLastMember = groupMemberRepository.countByGroupId(oldGroupId) == 1;

        groupMemberRepository.delete(gm);

        if (isLastMember) {
            // 마지막 멤버 탈퇴: 그룹 데이터 전체 삭제 후 그룹 삭제
            groupDataCleanupService.deleteAllGroupData(oldGroupId);
            familyGroupRepository.deleteById(oldGroupId);
        } else {
            // 가족 그룹에서 탈퇴: 본인 펫 + 해당 펫만의 기록을 개인 그룹으로 이전
            Member member = findMember(userId);
            FamilyGroupResponse newGroupResponse = createGroupForNewMember(member);

            UUID newGroupId = groupMemberRepository.findGroupIdByUserId(userId)
                    .orElseThrow(() -> new IllegalStateException("개인 그룹 생성에 실패했습니다."));
            memoryRepository.bulkMoveMyPetMemories(
                    oldGroupId.toString(), newGroupId.toString(), userId.toString());
            petRepository.bulkMoveToGroupByRegisteredBy(userId, newGroupId);
            return newGroupResponse;
        }

        // 마지막 멤버 탈퇴 후 빈 개인 그룹 생성
        Member member = findMember(userId);
        return createGroupForNewMember(member);
    }

    public UUID getGroupIdByUserId(UUID userId) {
        return groupMemberRepository.findGroupIdByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("소속된 가족 그룹이 없습니다."));
    }

    public Optional<UUID> findGroupIdByUserId(UUID userId) {
        return groupMemberRepository.findGroupIdByUserId(userId);
    }

    public FamilyGroup getGroupByUserId(UUID userId) {
        return groupMemberRepository.findByUserId(userId)
                .map(GroupMember::getGroup)
                .orElseThrow(() -> new IllegalStateException("소속된 가족 그룹이 없습니다."));
    }

    private void joinAsOwner(FamilyGroup group, Member member) {
        GroupMember gm = GroupMember.builder()
                .id(new GroupMemberId(group.getId(), member.getId()))
                .group(group)
                .member(member)
                .role(GroupRole.OWNER)
                .build();
        groupMemberRepository.save(gm);
    }

    private FamilyGroupResponse buildResponse(FamilyGroup group, GroupRole myRole, UUID userId) {
        List<GroupMemberResponse> members = groupMemberRepository.findAllByGroupId(group.getId())
                .stream().map(GroupMemberResponse::from).toList();
        return FamilyGroupResponse.of(group, myRole, members);
    }

    private Member findMember(UUID userId) {
        return memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                sb.append(CODE_CHARS.charAt(random.nextInt(CODE_CHARS.length())));
            }
            code = sb.toString();
        } while (familyGroupRepository.existsByInviteCode(code));
        return code;
    }
}
