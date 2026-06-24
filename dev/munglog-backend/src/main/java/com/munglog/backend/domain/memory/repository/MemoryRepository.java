package com.munglog.backend.domain.memory.repository;

import com.munglog.backend.domain.memory.domain.Memory;
import org.springframework.data.jpa.repository.JpaRepository;
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

    @Query("SELECT COUNT(m) FROM Memory m JOIN m.memoryDogs md WHERE m.user.id = :userId AND md.dog.id = :petId AND m.memoryDate BETWEEN :start AND :end")
    long countByUserAndDateRangeAndPet(
            @Param("userId") UUID userId,
            @Param("petId") UUID petId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query("SELECT DISTINCT m.memoryDate FROM Memory m WHERE m.user.id = :userId ORDER BY m.memoryDate DESC")
    List<LocalDate> findAllMemoryDatesByUserIdOrderByDesc(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT m FROM Memory m LEFT JOIN FETCH m.moments WHERE m.user.id = :userId AND m.memoryDate BETWEEN :start AND :end")
    List<Memory> findWithMomentsByUserAndDateRange(
            @Param("userId") UUID userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    Optional<Memory> findByIdAndUser_Id(UUID id, UUID userId);
}
