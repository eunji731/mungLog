package com.munglog.backend.domain.memory.repository;

import com.munglog.backend.domain.memory.domain.MemoryMoment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface MemoryMomentRepository extends JpaRepository<MemoryMoment, UUID> {

    @Query("SELECT mm.locationName, COUNT(mm) as cnt FROM MemoryMoment mm WHERE mm.memory.group.id = :groupId AND mm.locationName IS NOT NULL GROUP BY mm.locationName ORDER BY cnt DESC")
    List<Object[]> findFavoritePlacesByGroup(@Param("groupId") UUID groupId);

    @Query("SELECT mm.locationName, COUNT(mm) as cnt FROM MemoryMoment mm JOIN mm.memory m JOIN m.memoryDogs md WHERE m.group.id = :groupId AND md.dog.id = :petId AND mm.locationName IS NOT NULL GROUP BY mm.locationName ORDER BY cnt DESC")
    List<Object[]> findFavoritePlacesByGroupAndPet(@Param("groupId") UUID groupId, @Param("petId") UUID petId);

    @Query("SELECT COUNT(DISTINCT mm.locationName) FROM MemoryMoment mm WHERE mm.memory.group.id = :groupId AND mm.locationName IS NOT NULL AND mm.memory.memoryDate BETWEEN :start AND :end")
    long countDistinctVisitedPlacesByGroup(@Param("groupId") UUID groupId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COUNT(DISTINCT mm.locationName) FROM MemoryMoment mm JOIN mm.memory m JOIN m.memoryDogs md WHERE m.group.id = :groupId AND md.dog.id = :petId AND mm.locationName IS NOT NULL AND m.memoryDate BETWEEN :start AND :end")
    long countDistinctVisitedPlacesByGroupAndPet(@Param("groupId") UUID groupId, @Param("petId") UUID petId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    // 기존 user-based 쿼리 (하위 호환)
    @Query("SELECT mm.locationName, COUNT(mm) as cnt FROM MemoryMoment mm WHERE mm.memory.user.id = :userId AND mm.locationName IS NOT NULL GROUP BY mm.locationName ORDER BY cnt DESC")
    List<Object[]> findFavoritePlaces(@Param("userId") UUID userId);

    @Query("SELECT mm.locationName, COUNT(mm) as cnt FROM MemoryMoment mm JOIN mm.memory m JOIN m.memoryDogs md WHERE m.user.id = :userId AND md.dog.id = :petId AND mm.locationName IS NOT NULL GROUP BY mm.locationName ORDER BY cnt DESC")
    List<Object[]> findFavoritePlacesByPet(@Param("userId") UUID userId, @Param("petId") UUID petId);

    @Query("SELECT COUNT(DISTINCT mm.locationName) FROM MemoryMoment mm WHERE mm.memory.user.id = :userId AND mm.locationName IS NOT NULL AND mm.memory.memoryDate BETWEEN :start AND :end")
    long countDistinctVisitedPlaces(@Param("userId") UUID userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COUNT(DISTINCT mm.locationName) FROM MemoryMoment mm JOIN mm.memory m JOIN m.memoryDogs md WHERE m.user.id = :userId AND md.dog.id = :petId AND mm.locationName IS NOT NULL AND m.memoryDate BETWEEN :start AND :end")
    long countDistinctVisitedPlacesByPet(@Param("userId") UUID userId, @Param("petId") UUID petId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT AVG(CASE mm.energyLevel WHEN 'HIGH' THEN 3 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 1 ELSE 0 END) FROM MemoryMoment mm WHERE mm.memory.user.id = :userId AND mm.memory.memoryDate BETWEEN :start AND :end")
    Double findAvgEnergyLevel(@Param("userId") UUID userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT DISTINCT mm.locationName FROM MemoryMoment mm WHERE mm.memory.user.id = :userId AND mm.locationName IS NOT NULL")
    List<String> findDistinctLocationNames(@Param("userId") UUID userId);

    @Query("SELECT mm.locationName, mm.energyLevel, COUNT(mm) FROM MemoryMoment mm WHERE mm.memory.user.id = :userId AND mm.locationName IS NOT NULL GROUP BY mm.locationName, mm.energyLevel")
    List<Object[]> findLocationEnergyStats(@Param("userId") UUID userId);

    @Query("SELECT mm.category, COUNT(mm) FROM MemoryMoment mm WHERE mm.memory.user.id = :userId AND mm.memory.memoryDate BETWEEN :start AND :end GROUP BY mm.category")
    List<Object[]> findCategoryDistribution(@Param("userId") UUID userId, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
