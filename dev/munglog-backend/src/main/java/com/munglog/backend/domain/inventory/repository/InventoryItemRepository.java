package com.munglog.backend.domain.inventory.repository;

import com.munglog.backend.domain.inventory.domain.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 반려동물 용품 레포지토리.
 * InventoryItem 엔티티의 DB 조회·수정·삭제 쿼리를 정의하는 인터페이스.
 */
public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {

    /**
     * [목적] 그룹에 속한 용품 목록을 최신 등록순으로 조회한다.
     *
     * @param groupId 가족 그룹 UUID
     * @return 용품 목록 (등록일 내림차순)
     */
    List<InventoryItem> findAllByGroupIdOrderByCreatedAtDesc(UUID groupId);

    /**
     * [목적] 특정 용품이 해당 그룹에 속하는지 검증하며 단건 조회한다.
     *
     * @param id      용품 UUID
     * @param groupId 가족 그룹 UUID
     * @return 용품 Optional (타 그룹 접근 방지)
     */
    Optional<InventoryItem> findByIdAndGroupId(UUID id, UUID groupId);

    /**
     * [목적] 그룹 합류 시 소속 그룹을 일괄 변경한다.
     * [설명] 개인 그룹(1인)에서 가족 그룹으로 합류할 때 기존 데이터를 이전하기 위해 사용한다.
     *
     * @param sourceGroupId 원본 그룹 UUID
     * @param targetGroupId 이전 대상 그룹 UUID
     * @return 변경된 행 수
     */
    @Modifying
    @Query("UPDATE InventoryItem i SET i.group.id = :targetGroupId WHERE i.group.id = :sourceGroupId")
    int bulkMoveToGroup(@Param("sourceGroupId") UUID sourceGroupId, @Param("targetGroupId") UUID targetGroupId);

    /**
     * [목적] 그룹 삭제 시 해당 그룹의 모든 용품을 삭제한다.
     *
     * @param groupId 삭제할 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM InventoryItem i WHERE i.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
