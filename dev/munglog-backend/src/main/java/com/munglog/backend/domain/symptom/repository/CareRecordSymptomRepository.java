package com.munglog.backend.domain.symptom.repository;

import com.munglog.backend.domain.symptom.domain.CareRecordSymptom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CareRecordSymptomRepository extends JpaRepository<CareRecordSymptom, Long> {
    List<CareRecordSymptom> findAllByCareRecordId(UUID careRecordId);
    void deleteAllByCareRecordId(UUID careRecordId);

    @Modifying
    @Query("DELETE FROM CareRecordSymptom crs WHERE crs.petId IN (SELECT p.id FROM Pet p WHERE p.group.id = :groupId)")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);

    @Modifying
    @Query("UPDATE CareRecordSymptom crs SET crs.symptomId = :targetId WHERE crs.symptomId = :sourceId")
    void updateSymptomId(@Param("sourceId") Long sourceId, @Param("targetId") Long targetId);
}
