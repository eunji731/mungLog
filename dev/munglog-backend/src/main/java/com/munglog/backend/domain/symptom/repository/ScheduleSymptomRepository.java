package com.munglog.backend.domain.symptom.repository;

import com.munglog.backend.domain.symptom.domain.ScheduleSymptom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ScheduleSymptomRepository extends JpaRepository<ScheduleSymptom, Long> {
    List<ScheduleSymptom> findAllByScheduleId(UUID scheduleId);
    void deleteAllByScheduleId(UUID scheduleId);
}
