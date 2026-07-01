package com.munglog.backend.domain.memory.repository;

import com.munglog.backend.domain.memory.domain.MemoryDog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

/**
 * 기억(Memory)에 태그된 반려동물 연결 레포지토리.
 * MemoryDog(기억-반려동물 연결) 엔티티의 DB 조작을 담당하는 인터페이스.
 */
public interface MemoryDogRepository extends JpaRepository<MemoryDog, UUID> {

    /**
     * [목적] 그룹 삭제 시 해당 그룹의 모든 기억-반려동물 연결 데이터를 삭제한다.
     *
     * @param groupId 삭제할 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM MemoryDog md WHERE md.memory.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
