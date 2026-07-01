package com.munglog.backend.domain.memory.repository;

import com.munglog.backend.domain.memory.domain.Memory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 기억(Memory) 레포지토리.
 * Memory 엔티티의 DB 조회·수정·삭제 쿼리를 정의하는 인터페이스.
 * 그룹 기반과 레거시 사용자 기반 쿼리를 모두 지원한다.
 */
public interface MemoryRepository extends JpaRepository<Memory, UUID> {

    /**
     * [목적] 특정 사용자의 기억 목록을 날짜 최신순으로 조회한다. (레거시 user-based)
     *
     * @param userId 사용자 UUID
     * @return 기억 목록 (날짜 내림차순)
     */
    List<Memory> findByUser_IdOrderByMemoryDateDesc(UUID userId);

    /**
     * [목적] 특정 사용자의 기간 내 기억 목록을 날짜 최신순으로 조회한다. (레거시 user-based)
     *
     * @param userId 사용자 UUID
     * @param start  시작일
     * @param end    종료일
     * @return 기억 목록 (날짜 내림차순)
     */
    @Query("SELECT m FROM Memory m WHERE m.user.id = :userId AND m.memoryDate BETWEEN :start AND :end ORDER BY m.memoryDate DESC")
    List<Memory> findByUser_IdAndMemoryDateBetweenOrderByMemoryDateDesc(
            @Param("userId") UUID userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    /**
     * [목적] 그룹의 기억 목록을 날짜 최신순으로 조회한다.
     *
     * @param groupId 가족 그룹 UUID
     * @return 기억 목록 (날짜 내림차순)
     */
    @Query("SELECT m FROM Memory m WHERE m.group.id = :groupId ORDER BY m.memoryDate DESC")
    List<Memory> findByGroupIdOrderByMemoryDateDesc(@Param("groupId") UUID groupId);

    /**
     * [목적] 그룹의 기간 내 기억 목록을 날짜 최신순으로 조회한다.
     *
     * @param groupId 가족 그룹 UUID
     * @param start   시작일
     * @param end     종료일
     * @return 기억 목록 (날짜 내림차순)
     */
    @Query("SELECT m FROM Memory m WHERE m.group.id = :groupId AND m.memoryDate BETWEEN :start AND :end ORDER BY m.memoryDate DESC")
    List<Memory> findByGroupIdAndMemoryDateBetween(
            @Param("groupId") UUID groupId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    /**
     * [목적] 기간 내 특정 반려동물이 포함된 기억 수를 그룹 기준으로 집계한다.
     *
     * @param groupId 가족 그룹 UUID
     * @param petId   반려동물 UUID
     * @param start   시작일
     * @param end     종료일
     * @return 기억 수
     */
    @Query("SELECT COUNT(m) FROM Memory m JOIN m.memoryDogs md WHERE m.group.id = :groupId AND md.dog.id = :petId AND m.memoryDate BETWEEN :start AND :end")
    long countByGroupAndDateRangeAndPet(
            @Param("groupId") UUID groupId,
            @Param("petId") UUID petId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    /**
     * [목적] 기간 내 특정 반려동물이 포함된 기억 수를 사용자 기준으로 집계한다. (레거시 user-based)
     *
     * @param userId 사용자 UUID
     * @param petId  반려동물 UUID
     * @param start  시작일
     * @param end    종료일
     * @return 기억 수
     */
    @Query("SELECT COUNT(m) FROM Memory m JOIN m.memoryDogs md WHERE m.user.id = :userId AND md.dog.id = :petId AND m.memoryDate BETWEEN :start AND :end")
    long countByUserAndDateRangeAndPet(
            @Param("userId") UUID userId,
            @Param("petId") UUID petId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    /**
     * [목적] 그룹의 모든 기억 날짜를 최신순으로 조회한다. (캘린더 표시용)
     *
     * @param groupId 가족 그룹 UUID
     * @return 기억이 있는 날짜 목록 (최신순)
     */
    @Query("SELECT DISTINCT m.memoryDate FROM Memory m WHERE m.group.id = :groupId ORDER BY m.memoryDate DESC")
    List<LocalDate> findAllMemoryDatesByGroupIdOrderByDesc(@Param("groupId") UUID groupId);

    /**
     * [목적] 그룹 + 특정 반려동물의 기억 날짜를 최신순으로 조회한다.
     *
     * @param groupId 가족 그룹 UUID
     * @param petId   반려동물 UUID
     * @return 기억 날짜 목록 (최신순)
     */
    @Query("SELECT DISTINCT m.memoryDate FROM Memory m JOIN m.memoryDogs md WHERE m.group.id = :groupId AND md.dog.id = :petId ORDER BY m.memoryDate DESC")
    List<LocalDate> findAllMemoryDatesByGroupIdAndPetOrderByDesc(@Param("groupId") UUID groupId, @Param("petId") UUID petId);

    /**
     * [목적] 사용자의 모든 기억 날짜를 최신순으로 조회한다. (레거시 user-based)
     *
     * @param userId 사용자 UUID
     * @return 기억 날짜 목록 (최신순)
     */
    @Query("SELECT DISTINCT m.memoryDate FROM Memory m WHERE m.user.id = :userId ORDER BY m.memoryDate DESC")
    List<LocalDate> findAllMemoryDatesByUserIdOrderByDesc(@Param("userId") UUID userId);

    /**
     * [목적] 사용자 + 반려동물 기준으로 기억 날짜를 최신순 조회한다. (레거시 user-based)
     *
     * @param userId 사용자 UUID
     * @param petId  반려동물 UUID
     * @return 기억 날짜 목록 (최신순)
     */
    @Query("SELECT DISTINCT m.memoryDate FROM Memory m JOIN m.memoryDogs md WHERE m.user.id = :userId AND md.dog.id = :petId ORDER BY m.memoryDate DESC")
    List<LocalDate> findAllMemoryDatesByUserIdAndPetOrderByDesc(@Param("userId") UUID userId, @Param("petId") UUID petId);

    /**
     * [목적] 기간 내 사용자 기억을 moments와 함께 페치 조인하여 조회한다. (N+1 방지용)
     *
     * @param userId 사용자 UUID
     * @param start  시작일
     * @param end    종료일
     * @return moments가 함께 로드된 기억 목록
     */
    @Query("SELECT DISTINCT m FROM Memory m LEFT JOIN FETCH m.moments WHERE m.user.id = :userId AND m.memoryDate BETWEEN :start AND :end")
    List<Memory> findWithMomentsByUserAndDateRange(
            @Param("userId") UUID userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    /**
     * [목적] 기간 내 그룹 기억을 moments와 함께 페치 조인하여 조회한다. (N+1 방지용)
     *
     * @param groupId 가족 그룹 UUID
     * @param start   시작일
     * @param end     종료일
     * @return moments가 함께 로드된 기억 목록
     */
    @Query("SELECT DISTINCT m FROM Memory m LEFT JOIN FETCH m.moments WHERE m.group.id = :groupId AND m.memoryDate BETWEEN :start AND :end")
    List<Memory> findWithMomentsByGroupAndDateRange(
            @Param("groupId") UUID groupId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    /**
     * [목적] 기억 ID와 사용자 ID로 단건 조회한다. (삭제 시 소유권 검증용)
     *
     * @param id     기억 UUID
     * @param userId 사용자 UUID
     * @return 기억 Optional
     */
    Optional<Memory> findByIdAndUser_Id(UUID id, UUID userId);

    /**
     * [목적] 기억 ID와 그룹 ID로 단건 조회한다. (상세 조회 시 그룹 권한 검증용)
     *
     * @param id      기억 UUID
     * @param groupId 가족 그룹 UUID
     * @return 기억 Optional
     */
    @Query("SELECT m FROM Memory m WHERE m.id = :id AND m.group.id = :groupId")
    Optional<Memory> findByIdAndGroupId(@Param("id") UUID id, @Param("groupId") UUID groupId);

    /**
     * [목적] 그룹 합류 시 기억의 소속 그룹을 일괄 변경한다.
     *
     * @param sourceGroupId 원본 그룹 UUID
     * @param targetGroupId 이전 대상 그룹 UUID
     * @return 변경된 행 수
     */
    @Modifying
    @Query("UPDATE Memory m SET m.group.id = :targetGroupId WHERE m.group.id = :sourceGroupId")
    int bulkMoveToGroup(@Param("sourceGroupId") UUID sourceGroupId, @Param("targetGroupId") UUID targetGroupId);

    /**
     * [목적] 그룹 대표 사진 경로를 일괄 초기화한다.
     *
     * @param groupId 그룹 UUID
     */
    @Modifying
    @Query("UPDATE Memory m SET m.representativePhoto = null WHERE m.group.id = :groupId")
    void clearRepresentativePhotosByGroupId(@Param("groupId") UUID groupId);

    /**
     * [목적] 그룹 삭제 시 해당 그룹의 모든 기억을 삭제한다.
     *
     * @param groupId 삭제할 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM Memory m WHERE m.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);

    /**
     * [목적] 가족 그룹 탈퇴 시 본인 반려동물만 태그된 기억을 개인 그룹으로 이전한다.
     * [설명] 다른 그룹원의 반려동물이 함께 태그된 공유 기억은 제외하여 데이터 무결성을 유지한다.
     *        네이티브 쿼리를 사용하므로 UUID는 문자열로 전달한다.
     *
     * @param oldGroupId 기존 그룹 UUID 문자열
     * @param newGroupId 이전할 개인 그룹 UUID 문자열
     * @param userId     탈퇴 사용자 UUID 문자열
     * @return 이전된 행 수
     */
    @Modifying
    @Query(value = """
            UPDATE tb_memory m SET group_id = CAST(:newGroupId AS uuid)
            WHERE m.group_id = CAST(:oldGroupId AS uuid)
            AND EXISTS (
                SELECT 1 FROM tb_memory_dog md WHERE md.memory_id = m.id
            )
            AND NOT EXISTS (
                SELECT 1 FROM tb_memory_dog md
                JOIN tb_pet p ON md.dog_id = p.id
                WHERE md.memory_id = m.id
                AND (p.registered_by IS NULL OR p.registered_by != CAST(:userId AS uuid))
            )
            """, nativeQuery = true)
    int bulkMoveMyPetMemories(
            @Param("oldGroupId") String oldGroupId,
            @Param("newGroupId") String newGroupId,
            @Param("userId") String userId);
}
