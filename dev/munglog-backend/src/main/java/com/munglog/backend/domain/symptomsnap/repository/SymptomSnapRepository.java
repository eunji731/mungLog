package com.munglog.backend.domain.symptomsnap.repository;

import com.munglog.backend.domain.symptomsnap.domain.SymptomSnap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SymptomSnapRepository extends JpaRepository<SymptomSnap, UUID> {

    Optional<SymptomSnap> findByIdAndUser_Id(UUID id, UUID userId);

    @Query("SELECT s FROM SymptomSnap s WHERE s.pet.group.id = :groupId AND s.id = :id")
    Optional<SymptomSnap> findByIdAndGroupId(@Param("id") UUID id, @Param("groupId") UUID groupId);

    List<SymptomSnap> findByLinkedScheduleId(UUID linkedScheduleId);

    List<SymptomSnap> findByResolvedRecordId(UUID resolvedRecordId);

    @Query("SELECT s FROM SymptomSnap s WHERE s.pet.group.id = :groupId " +
            "AND (:petId IS NULL OR s.pet.id = :petId) " +
            "AND (:startDate IS NULL OR s.date >= :startDate) " +
            "AND (:endDate IS NULL OR s.date <= :endDate) " +
            "ORDER BY s.date DESC, s.time DESC")
    List<SymptomSnap> searchByGroup(@Param("groupId") UUID groupId, @Param("petId") UUID petId,
                                     @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Modifying
    @Query("DELETE FROM SymptomSnap s WHERE s.pet.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
