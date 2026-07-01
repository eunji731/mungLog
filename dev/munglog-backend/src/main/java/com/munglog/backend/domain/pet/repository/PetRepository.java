package com.munglog.backend.domain.pet.repository;

import com.munglog.backend.domain.pet.domain.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 반려동물 레포지토리.
 * 반려동물 엔티티에 대한 DB 접근을 담당한다.
 * 그룹 이동, 일괄 삭제 등 커스텀 쿼리를 포함한다.
 */
public interface PetRepository extends JpaRepository<Pet, UUID> {

    /**
     * [목적] 특정 그룹의 활성 반려동물 목록을 조회한다.
     * [설명] isActive=true인 반려동물만 반환하여 소프트 삭제된 항목을 제외한다.
     *
     * @param groupId 조회할 가족 그룹 UUID
     * @return 활성 반려동물 목록
     */
    List<Pet> findByGroupIdAndIsActiveTrue(UUID groupId);

    /**
     * [목적] 특정 그룹의 모든 반려동물(삭제 포함)을 조회한다.
     * [설명] isActive 여부와 무관하게 그룹에 속한 모든 반려동물을 반환한다.
     *
     * @param groupId 조회할 가족 그룹 UUID
     * @return 해당 그룹의 전체 반려동물 목록
     */
    List<Pet> findByGroupId(UUID groupId);

    /**
     * [목적] 특정 반려동물이 해당 그룹에 속하는지 확인하며 단건 조회한다.
     * [설명] 다른 그룹의 데이터에 접근하는 것을 방지하기 위해 ID와 groupId를 함께 조건으로 사용한다.
     *
     * @param id      반려동물 UUID
     * @param groupId 그룹 UUID
     * @return 반려동물 Optional
     */
    Optional<Pet> findByIdAndGroupId(UUID id, UUID groupId);

    /**
     * [목적] 소스 그룹의 모든 반려동물을 타겟 그룹으로 일괄 이동한다.
     * [설명] 가족 그룹 합류 시 개인 그룹의 데이터를 가족 그룹으로 이전할 때 사용한다.
     *
     * @param sourceGroupId 원래 그룹 UUID
     * @param targetGroupId 이동할 대상 그룹 UUID
     * @return 변경된 레코드 수
     */
    @Modifying
    @Query("UPDATE Pet p SET p.group.id = :targetGroupId WHERE p.group.id = :sourceGroupId")
    int bulkMoveToGroup(@Param("sourceGroupId") UUID sourceGroupId, @Param("targetGroupId") UUID targetGroupId);

    /**
     * [목적] 특정 사용자가 등록한 반려동물을 타겟 그룹으로 일괄 이동한다.
     * [설명] 가족 그룹 탈퇴 후 개인 그룹을 생성할 때, 본인이 등록한 반려동물만 개인 그룹으로 옮긴다.
     *
     * @param userId        등록자 UUID
     * @param targetGroupId 이동할 대상 그룹 UUID
     * @return 변경된 레코드 수
     */
    @Modifying
    @Query("UPDATE Pet p SET p.group.id = :targetGroupId WHERE p.registeredBy = :userId")
    int bulkMoveToGroupByRegisteredBy(@Param("userId") UUID userId, @Param("targetGroupId") UUID targetGroupId);

    /**
     * [목적] 특정 그룹의 모든 반려동물을 DB에서 완전히 삭제한다.
     * [설명] 그룹이 완전히 해체될 때 연관된 모든 반려동물을 일괄 하드 삭제한다.
     *
     * @param groupId 삭제 대상 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM Pet p WHERE p.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
