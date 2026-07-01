package com.munglog.backend.domain.family.repository;

import com.munglog.backend.domain.family.domain.GroupMember;
import com.munglog.backend.domain.family.domain.GroupMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * GroupMember 엔티티에 대한 데이터 접근 인터페이스.
 * 사용자 ID 기반 그룹 조회, 구성원 수 집계 등 그룹 멤버십 관련 쿼리를 제공한다.
 */
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {

    /**
     * [목적] 사용자 ID로 해당 사용자의 그룹 멤버십을 조회한다.
     *
     * @param userId 조회할 사용자 UUID
     * @return GroupMember (그룹에 미소속이면 empty)
     */
    @Query("SELECT gm FROM GroupMember gm WHERE gm.member.id = :userId")
    Optional<GroupMember> findByUserId(@Param("userId") UUID userId);

    /**
     * [목적] 사용자 ID로 해당 사용자가 속한 그룹의 ID만 조회한다.
     * [설명] 그룹 엔티티 전체가 아닌 ID만 필요할 때 사용하여 불필요한 조인을 줄인다.
     *
     * @param userId 조회할 사용자 UUID
     * @return 소속 그룹 UUID (없으면 empty)
     */
    @Query("SELECT gm.group.id FROM GroupMember gm WHERE gm.member.id = :userId")
    Optional<UUID> findGroupIdByUserId(@Param("userId") UUID userId);

    /**
     * [목적] 그룹 ID로 해당 그룹의 모든 구성원을 조회한다.
     * [설명] member 엔티티를 FETCH JOIN하여 N+1 문제를 방지한다.
     *
     * @param groupId 조회할 그룹 UUID
     * @return 구성원 목록
     */
    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.member WHERE gm.group.id = :groupId")
    List<GroupMember> findAllByGroupId(@Param("groupId") UUID groupId);

    /**
     * [목적] 특정 사용자가 특정 그룹에 속해 있는지 확인한다.
     *
     * @param groupId  확인할 그룹 UUID
     * @param memberId 확인할 사용자 UUID
     * @return 구성원이면 true
     */
    boolean existsByGroupIdAndMemberId(UUID groupId, UUID memberId);

    /**
     * [목적] 그룹에 속한 구성원 수를 반환한다.
     * [설명] 탈퇴 가능 여부나 마지막 멤버 여부를 판단할 때 사용된다.
     *
     * @param groupId 조회할 그룹 UUID
     * @return 구성원 수
     */
    @Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.group.id = :groupId")
    long countByGroupId(@Param("groupId") UUID groupId);
}
