package com.munglog.backend.domain.care.repository;

import com.munglog.backend.domain.care.domain.CareRecord;
import com.munglog.backend.domain.care.domain.CareRecordType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CareRecordRepository extends JpaRepository<CareRecord, UUID> {

    @Query("SELECT c FROM CareRecord c WHERE c.user.id = :userId AND c.pet.id = :petId AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.note) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY c.recordDate DESC")
    List<CareRecord> findByUserIdAndPetIdAndKeyword(@Param("userId") UUID userId, @Param("petId") UUID petId, @Param("keyword") String keyword);

    @Query("SELECT c FROM CareRecord c WHERE c.user.id = :userId AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.note) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY c.recordDate DESC")
    List<CareRecord> findByUserIdAndKeyword(@Param("userId") UUID userId, @Param("keyword") String keyword);

    @Query("SELECT c FROM CareRecord c WHERE c.user.id = :userId AND c.pet.id = :petId ORDER BY c.recordDate DESC")
    List<CareRecord> findByUserIdAndPetId(@Param("userId") UUID userId, @Param("petId") UUID petId);

    @Query("SELECT c FROM CareRecord c WHERE c.user.id = :userId ORDER BY c.recordDate DESC")
    List<CareRecord> findByUserId(@Param("userId") UUID userId);

    Optional<CareRecord> findByIdAndUser_Id(UUID id, UUID userId);

    Optional<CareRecord> findBySourceScheduleId(UUID sourceScheduleId);

    @Query("SELECT c FROM CareRecord c WHERE c.user.id = :userId AND c.pet.id = :petId AND c.recordType = :recordType AND c.recordDate >= :from ORDER BY c.recordDate DESC")
    List<CareRecord> findMedicalCandidates(@Param("userId") UUID userId, @Param("petId") UUID petId,
                                            @Param("recordType") CareRecordType recordType,
                                            @Param("from") LocalDate from);
}
