package com.munglog.backend.domain.memory.repository;

import com.munglog.backend.domain.memory.domain.MemoryDog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface MemoryDogRepository extends JpaRepository<MemoryDog, UUID> {

    @Modifying
    @Query("DELETE FROM MemoryDog md WHERE md.memory.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
