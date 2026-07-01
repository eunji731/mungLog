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

/**
 * 가족 그룹 서비스.
 * 그룹 생성·참여·탈퇴, 초대 코드 관리, 소유권 위임 등 가족 그룹 관련 핵심 비즈니스 로직을 처리한다.
 * 그룹 탈퇴 또는 합류 시 반려동물·기억·인벤토리 데이터를 적절한 그룹으로 이전한다.
 * 주요 기능: 그룹 생성, 초대 코드로 참여, 탈퇴, 소유권 위임, 초대 코드 갱신
 */
@Service
@RequiredArgsConstructor
public class FamilyGroupService {

    /** 초대 코드 생성에 사용할 문자 집합 (혼동하기 쉬운 0, O, 1, I 제외) */
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    /** 초대 코드 길이 */
    private static final int CODE_LENGTH = 8;

    /** 초대 코드 생성용 암호학적으로 안전한 난수 생성기 */
    private final SecureRandom random = new SecureRandom();

    private final FamilyGroupRepository familyGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final MemberRepository memberRepository;
    private final PetRepository petRepository;
    private final MemoryRepository memoryRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final VaccinationTypeRepository vaccinationTypeRepository;
    private final GroupDataCleanupService groupDataCleanupService;

    /**
     * [목적] 사용자가 새 가족 그룹을 직접 생성한다.
     * [설명] 이미 그룹에 속해 있으면 예외를 발생시킨다.
     *        name이 null이거나 공백이면 "{사용자 이름}의 가족"으로 자동 설정된다.
     *        생성자는 자동으로 OWNER 역할로 참여한다.
     *
     * @param userId 그룹을 생성하는 사용자 UUID
     * @param name   그룹 이름 (null 허용)
     * @return 생성된 그룹 응답 DTO
     * @throws IllegalStateException 이미 다른 그룹에 속해 있을 경우
     */
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

    /**
     * [목적] 신규 회원을 위한 개인 그룹을 자동으로 생성한다.
     * [설명] OAuth2 로그인 시 신규 회원에게 자동으로 1인 개인 그룹을 부여할 때 호출된다.
     *        생성된 그룹에 해당 회원이 OWNER로 자동 참여된다.
     *
     * @param member 그룹을 생성할 신규 회원 엔티티
     * @return 생성된 그룹 응답 DTO
     */
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

    /**
     * [목적] 초대 코드를 입력하여 기존 가족 그룹에 참여한다.
     * [설명] 현재 개인 그룹(1인)에 속해 있다면 데이터를 대상 그룹으로 이전 후 개인 그룹을 삭제한다.
     *        다른 구성원이 있는 그룹에 속해 있다면 먼저 탈퇴해야 한다.
     *
     * @param userId     참여 요청 사용자 UUID
     * @param inviteCode 참여할 그룹의 초대 코드
     * @return 참여한 그룹 응답 DTO
     * @throws IllegalArgumentException 유효하지 않은 초대 코드인 경우
     * @throws IllegalStateException    이미 해당 그룹 소속이거나 탈퇴가 필요한 경우
     */
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

    /**
     * [목적] 개인 그룹의 모든 데이터를 대상 그룹으로 일괄 이전한다.
     * [설명] 반려동물, 기억, 인벤토리, 예방접종 데이터의 group_id를 일괄 업데이트한다.
     *
     * @param sourceGroupId 이전 원본 그룹 UUID
     * @param targetGroupId 이전 대상 그룹 UUID
     */
    private void mergeGroupData(UUID sourceGroupId, UUID targetGroupId) {
        petRepository.bulkMoveToGroup(sourceGroupId, targetGroupId);
        memoryRepository.bulkMoveToGroup(sourceGroupId, targetGroupId);
        inventoryItemRepository.bulkMoveToGroup(sourceGroupId, targetGroupId);
        vaccinationTypeRepository.bulkMoveToGroup(sourceGroupId, targetGroupId);
    }

    /**
     * [목적] 현재 사용자가 속한 가족 그룹 정보를 조회한다.
     *
     * @param userId 조회 요청 사용자 UUID
     * @return 소속 그룹 응답 DTO
     * @throws IllegalStateException 소속된 그룹이 없는 경우
     */
    @Transactional(readOnly = true)
    public FamilyGroupResponse getMyGroup(UUID userId) {
        GroupMember gm = groupMemberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("소속된 가족 그룹이 없습니다."));
        return buildResponse(gm.getGroup(), gm.getRole(), userId);
    }

    /**
     * [목적] 그룹의 초대 코드를 새로운 값으로 갱신한다.
     * [설명] OWNER만 호출할 수 있으며, 기존 초대 코드는 무효화된다.
     *
     * @param userId 요청 사용자 UUID
     * @return 새로 생성된 초대 코드 문자열
     * @throws IllegalStateException OWNER가 아닌 경우
     */
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

    /**
     * [목적] 그룹 이름을 수정한다.
     * [설명] OWNER만 호출 가능하며, 빈 이름은 허용하지 않는다.
     *
     * @param userId 요청 사용자 UUID
     * @param name   변경할 새 그룹 이름
     * @return 수정된 그룹 응답 DTO
     * @throws IllegalStateException    OWNER가 아닌 경우
     * @throws IllegalArgumentException 이름이 비어 있는 경우
     */
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

    /**
     * [목적] 그룹 소유권(OWNER 역할)을 다른 구성원에게 위임한다.
     * [설명] 현재 OWNER의 역할은 MEMBER로 강등되고, 대상 구성원이 OWNER가 된다.
     *        자기 자신에게는 위임할 수 없다.
     *
     * @param userId         현재 OWNER 사용자 UUID
     * @param newOwnerUserId 새로운 OWNER로 지정할 구성원 UUID
     * @return 소유권 위임 후 그룹 응답 DTO (현재 사용자 역할은 MEMBER)
     * @throws IllegalStateException    현재 사용자가 OWNER가 아닌 경우
     * @throws IllegalArgumentException 자기 자신에게 위임하거나 대상 구성원이 없는 경우
     */
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

    /**
     * [목적] 현재 사용자가 가족 그룹에서 탈퇴한다.
     * [설명] 탈퇴 시나리오는 두 가지다.
     *        1) 마지막 구성원: 그룹 데이터 전체 삭제 후 새 개인 그룹 생성.
     *        2) 다른 구성원 존재: 본인이 등록한 펫·기억만 새 개인 그룹으로 이전.
     *        OWNER이면서 다른 구성원이 있을 경우 먼저 소유권을 위임해야 한다.
     *
     * @param userId 탈퇴 요청 사용자 UUID
     * @return 탈퇴 후 생성된 새 개인 그룹 응답 DTO
     * @throws IllegalStateException OWNER이면서 다른 구성원이 있는 경우
     */
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

    /**
     * [목적] 사용자 ID로 소속 그룹 UUID를 반환한다. 그룹이 없으면 예외를 발생시킨다.
     *
     * @param userId 조회할 사용자 UUID
     * @return 소속 그룹 UUID
     * @throws IllegalStateException 그룹에 미소속인 경우
     */
    public UUID getGroupIdByUserId(UUID userId) {
        return groupMemberRepository.findGroupIdByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("소속된 가족 그룹이 없습니다."));
    }

    /**
     * [목적] 사용자 ID로 소속 그룹 UUID를 Optional로 반환한다. 그룹이 없어도 예외 없이 empty를 반환한다.
     *
     * @param userId 조회할 사용자 UUID
     * @return 소속 그룹 UUID Optional
     */
    public Optional<UUID> findGroupIdByUserId(UUID userId) {
        return groupMemberRepository.findGroupIdByUserId(userId);
    }

    /**
     * [목적] 사용자 ID로 소속 FamilyGroup 엔티티를 반환한다.
     *
     * @param userId 조회할 사용자 UUID
     * @return 소속 FamilyGroup 엔티티
     * @throws IllegalStateException 그룹에 미소속인 경우
     */
    public FamilyGroup getGroupByUserId(UUID userId) {
        return groupMemberRepository.findByUserId(userId)
                .map(GroupMember::getGroup)
                .orElseThrow(() -> new IllegalStateException("소속된 가족 그룹이 없습니다."));
    }

    /**
     * [목적] 주어진 회원을 그룹의 OWNER로 등록한다.
     *
     * @param group  참여할 FamilyGroup 엔티티
     * @param member OWNER로 등록할 Member 엔티티
     */
    private void joinAsOwner(FamilyGroup group, Member member) {
        GroupMember gm = GroupMember.builder()
                .id(new GroupMemberId(group.getId(), member.getId()))
                .group(group)
                .member(member)
                .role(GroupRole.OWNER)
                .build();
        groupMemberRepository.save(gm);
    }

    /**
     * [목적] 그룹 응답 DTO를 조립한다.
     * [설명] 그룹 엔티티와 요청한 사용자의 역할을 조합하여 FamilyGroupResponse를 생성한다.
     *
     * @param group  응답을 생성할 FamilyGroup 엔티티
     * @param myRole 요청 사용자의 현재 역할
     * @param userId 요청 사용자 UUID
     * @return FamilyGroupResponse 인스턴스
     */
    private FamilyGroupResponse buildResponse(FamilyGroup group, GroupRole myRole, UUID userId) {
        List<GroupMemberResponse> members = groupMemberRepository.findAllByGroupId(group.getId())
                .stream().map(GroupMemberResponse::from).toList();
        return FamilyGroupResponse.of(group, myRole, members);
    }

    /**
     * [목적] 사용자 ID로 Member 엔티티를 조회한다.
     *
     * @param userId 조회할 사용자 UUID
     * @return Member 엔티티
     * @throws IllegalArgumentException 사용자가 존재하지 않는 경우
     */
    private Member findMember(UUID userId) {
        return memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    /**
     * [목적] 중복되지 않는 초대 코드를 생성한다.
     * [설명] CODE_CHARS에서 CODE_LENGTH 길이의 랜덤 문자열을 생성하고,
     *        DB에 이미 존재하면 재생성을 반복한다.
     *
     * @return 고유한 초대 코드 문자열
     */
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
