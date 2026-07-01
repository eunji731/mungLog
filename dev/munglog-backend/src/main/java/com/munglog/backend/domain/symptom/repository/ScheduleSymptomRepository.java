package com.munglog.backend.domain.symptom.repository;

import com.munglog.backend.domain.symptom.domain.ScheduleSymptom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ScheduleSymptomRepository extends JpaRepository<ScheduleSymptom, Long> {
    List<ScheduleSymptom> findAllByScheduleId(UUID scheduleId);
    void deleteAllByScheduleId(UUID scheduleId);

    @Modifying
    @Query("DELETE FROM ScheduleSymptom ss WHERE ss.scheduleId IN (SELECT s.id FROM Schedule s WHERE s.pet.group.id = :groupId)")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);

    @Modifying
    @Query("UPDATE ScheduleSymptom ss SET ss.symptomId = :targetId WHERE ss.symptomId = :sourceId")
    void updateSymptomId(@Param("sourceId") Long sourceId, @Param("targetId") Long targetId);
}
