package com.munglog.backend.domain.family.repository;

import com.munglog.backend.domain.family.domain.FamilyGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * FamilyGroup 엔티티에 대한 데이터 접근 인터페이스.
 * 초대 코드 기반 조회 및 중복 여부 확인 기능을 제공한다.
 */
public interface FamilyGroupRepository extends JpaRepository<FamilyGroup, UUID> {

    /**
     * [목적] 초대 코드로 가족 그룹을 조회한다.
     *
     * @param inviteCode 조회할 초대 코드 (대문자)
     * @return 해당 초대 코드의 그룹 (없으면 empty)
     */
    Optional<FamilyGroup> findByInviteCode(String inviteCode);

    /**
     * [목적] 초대 코드의 중복 여부를 확인한다.
     * [설명] 새 초대 코드 생성 시 충돌을 방지하기 위해 사용된다.
     *
     * @param inviteCode 확인할 초대 코드
     * @return 이미 존재하면 true
     */
    boolean existsByInviteCode(String inviteCode);
}
