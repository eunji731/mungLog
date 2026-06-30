package com.munglog.backend.domain.family.repository;

import com.munglog.backend.domain.family.domain.FamilyGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FamilyGroupRepository extends JpaRepository<FamilyGroup, UUID> {
    Optional<FamilyGroup> findByInviteCode(String inviteCode);
    boolean existsByInviteCode(String inviteCode);
}
