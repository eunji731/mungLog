package com.munglog.backend.domain.inventory.repository;

import com.munglog.backend.domain.inventory.domain.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {
    List<InventoryItem> findAllByGroupIdOrderByCreatedAtDesc(UUID groupId);
    Optional<InventoryItem> findByIdAndGroupId(UUID id, UUID groupId);

    @Modifying
    @Query("UPDATE InventoryItem i SET i.group.id = :targetGroupId WHERE i.group.id = :sourceGroupId")
    int bulkMoveToGroup(@Param("sourceGroupId") UUID sourceGroupId, @Param("targetGroupId") UUID targetGroupId);

    @Modifying
    @Query("DELETE FROM InventoryItem i WHERE i.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
