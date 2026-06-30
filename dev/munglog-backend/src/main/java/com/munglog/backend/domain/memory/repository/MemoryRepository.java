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

public interface MemoryRepository extends JpaRepository<Memory, UUID> {

    List<Memory> findByUser_IdOrderByMemoryDateDesc(UUID userId);

    @Query("SELECT m FROM Memory m WHERE m.user.id = :userId AND m.memoryDate BETWEEN :start AND :end ORDER BY m.memoryDate DESC")
    List<Memory> findByUser_IdAndMemoryDateBetweenOrderByMemoryDateDesc(
            @Param("userId") UUID userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query("SELECT m FROM Memory m WHERE m.group.id = :groupId ORDER BY m.memoryDate DESC")
    List<Memory> findByGroupIdOrderByMemoryDateDesc(@Param("groupId") UUID groupId);

    @Query("SELECT m FROM Memory m WHERE m.group.id = :groupId AND m.memoryDate BETWEEN :start AND :end ORDER BY m.memoryDate DESC")
    List<Memory> findByGroupIdAndMemoryDateBetween(
            @Param("groupId") UUID groupId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query("SELECT COUNT(m) FROM Memory m JOIN m.memoryDogs md WHERE m.group.id = :groupId AND md.dog.id = :petId AND m.memoryDate BETWEEN :start AND :end")
    long countByGroupAndDateRangeAndPet(
            @Param("groupId") UUID groupId,
            @Param("petId") UUID petId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query("SELECT COUNT(m) FROM Memory m JOIN m.memoryDogs md WHERE m.user.id = :userId AND md.dog.id = :petId AND m.memoryDate BETWEEN :start AND :end")
    long countByUserAndDateRangeAndPet(
            @Param("userId") UUID userId,
            @Param("petId") UUID petId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query("SELECT DISTINCT m.memoryDate FROM Memory m WHERE m.group.id = :groupId ORDER BY m.memoryDate DESC")
    List<LocalDate> findAllMemoryDatesByGroupIdOrderByDesc(@Param("groupId") UUID groupId);

    @Query("SELECT DISTINCT m.memoryDate FROM Memory m JOIN m.memoryDogs md WHERE m.group.id = :groupId AND md.dog.id = :petId ORDER BY m.memoryDate DESC")
    List<LocalDate> findAllMemoryDatesByGroupIdAndPetOrderByDesc(@Param("groupId") UUID groupId, @Param("petId") UUID petId);

    @Query("SELECT DISTINCT m.memoryDate FROM Memory m WHERE m.user.id = :userId ORDER BY m.memoryDate DESC")
    List<LocalDate> findAllMemoryDatesByUserIdOrderByDesc(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT m.memoryDate FROM Memory m JOIN m.memoryDogs md WHERE m.user.id = :userId AND md.dog.id = :petId ORDER BY m.memoryDate DESC")
    List<LocalDate> findAllMemoryDatesByUserIdAndPetOrderByDesc(@Param("userId") UUID userId, @Param("petId") UUID petId);

    @Query("SELECT DISTINCT m FROM Memory m LEFT JOIN FETCH m.moments WHERE m.user.id = :userId AND m.memoryDate BETWEEN :start AND :end")
    List<Memory> findWithMomentsByUserAndDateRange(
            @Param("userId") UUID userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query("SELECT DISTINCT m FROM Memory m LEFT JOIN FETCH m.moments WHERE m.group.id = :groupId AND m.memoryDate BETWEEN :start AND :end")
    List<Memory> findWithMomentsByGroupAndDateRange(
            @Param("groupId") UUID groupId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    Optional<Memory> findByIdAndUser_Id(UUID id, UUID userId);

    @Query("SELECT m FROM Memory m WHERE m.id = :id AND m.group.id = :groupId")
    Optional<Memory> findByIdAndGroupId(@Param("id") UUID id, @Param("groupId") UUID groupId);

    @Modifying
    @Query("UPDATE Memory m SET m.group.id = :targetGroupId WHERE m.group.id = :sourceGroupId")
    int bulkMoveToGroup(@Param("sourceGroupId") UUID sourceGroupId, @Param("targetGroupId") UUID targetGroupId);
}
