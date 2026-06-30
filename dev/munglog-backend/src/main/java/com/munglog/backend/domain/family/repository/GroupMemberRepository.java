package com.munglog.backend.domain.family.repository;

import com.munglog.backend.domain.family.domain.GroupMember;
import com.munglog.backend.domain.family.domain.GroupMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {

    @Query("SELECT gm FROM GroupMember gm WHERE gm.member.id = :userId")
    Optional<GroupMember> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT gm.group.id FROM GroupMember gm WHERE gm.member.id = :userId")
    Optional<UUID> findGroupIdByUserId(@Param("userId") UUID userId);

    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.member WHERE gm.group.id = :groupId")
    List<GroupMember> findAllByGroupId(@Param("groupId") UUID groupId);

    boolean existsByGroupIdAndMemberId(UUID groupId, UUID memberId);

    @Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.group.id = :groupId")
    long countByGroupId(@Param("groupId") UUID groupId);
}
