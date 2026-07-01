package com.munglog.backend.domain.care.repository;

import com.munglog.backend.domain.care.domain.CareRecord;
import com.munglog.backend.domain.care.domain.CareRecordType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CareRecordRepository extends JpaRepository<CareRecord, UUID> {

    @Query("SELECT c FROM CareRecord c WHERE c.pet.group.id = :groupId AND c.pet.id = :petId AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.note) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY c.recordDate DESC")
    List<CareRecord> findByGroupIdAndPetIdAndKeyword(@Param("groupId") UUID groupId, @Param("petId") UUID petId, @Param("keyword") String keyword);

    @Query("SELECT c FROM CareRecord c WHERE c.pet.group.id = :groupId AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.note) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY c.recordDate DESC")
    List<CareRecord> findByGroupIdAndKeyword(@Param("groupId") UUID groupId, @Param("keyword") String keyword);

    @Query("SELECT c FROM CareRecord c WHERE c.pet.group.id = :groupId AND c.pet.id = :petId ORDER BY c.recordDate DESC")
    List<CareRecord> findByGroupIdAndPetId(@Param("groupId") UUID groupId, @Param("petId") UUID petId);

    @Query("SELECT c FROM CareRecord c WHERE c.pet.group.id = :groupId ORDER BY c.recordDate DESC")
    List<CareRecord> findByGroupId(@Param("groupId") UUID groupId);

    @Query("SELECT c FROM CareRecord c WHERE c.id = :id AND c.pet.group.id = :groupId")
    Optional<CareRecord> findByIdAndGroupId(@Param("id") UUID id, @Param("groupId") UUID groupId);

    Optional<CareRecord> findBySourceScheduleId(UUID sourceScheduleId);

    @Query("SELECT c FROM CareRecord c WHERE c.pet.group.id = :groupId AND c.pet.id = :petId AND c.recordType = :recordType AND c.recordDate >= :from ORDER BY c.recordDate DESC")
    List<CareRecord> findMedicalCandidates(@Param("groupId") UUID groupId, @Param("petId") UUID petId,
                                            @Param("recordType") CareRecordType recordType,
                                            @Param("from") LocalDate from);

    List<CareRecord> findByVaccinationTypeId(Long vaccinationTypeId);

    @Modifying
    @Query("DELETE FROM CareRecord c WHERE c.pet.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
