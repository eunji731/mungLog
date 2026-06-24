package com.munglog.backend.domain.symptom.repository;

import com.munglog.backend.domain.symptom.domain.CareRecordSymptom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CareRecordSymptomRepository extends JpaRepository<CareRecordSymptom, Long> {
    List<CareRecordSymptom> findAllByCareRecordId(UUID careRecordId);
    void deleteAllByCareRecordId(UUID careRecordId);
}
