package com.munglog.backend.domain.symptom.repository;

import com.munglog.backend.domain.symptom.domain.SymptomSnapSymptom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SymptomSnapSymptomRepository extends JpaRepository<SymptomSnapSymptom, Long> {
    List<SymptomSnapSymptom> findAllBySymptomSnapId(UUID symptomSnapId);
    void deleteAllBySymptomSnapId(UUID symptomSnapId);

    @Modifying
    @Query("DELETE FROM SymptomSnapSymptom sss WHERE sss.symptomSnapId IN (SELECT s.id FROM SymptomSnap s WHERE s.pet.group.id = :groupId)")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);

    @Modifying
    @Query("UPDATE SymptomSnapSymptom sss SET sss.symptomId = :targetId WHERE sss.symptomId = :sourceId")
    void updateSymptomId(@Param("sourceId") Long sourceId, @Param("targetId") Long targetId);
}
