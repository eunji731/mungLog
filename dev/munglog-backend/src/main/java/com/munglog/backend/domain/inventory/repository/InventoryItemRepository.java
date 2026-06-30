package com.munglog.backend.domain.inventory.repository;

import com.munglog.backend.domain.inventory.domain.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {
    List<InventoryItem> findAllByGroupIdOrderByCreatedAtDesc(UUID groupId);
    Optional<InventoryItem> findByIdAndGroupId(UUID id, UUID groupId);
}
