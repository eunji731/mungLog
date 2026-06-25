package com.munglog.backend.domain.symptom.repository;

import com.munglog.backend.domain.symptom.domain.SymptomSnapSymptom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SymptomSnapSymptomRepository extends JpaRepository<SymptomSnapSymptom, Long> {
    List<SymptomSnapSymptom> findAllBySymptomSnapId(UUID symptomSnapId);
    void deleteAllBySymptomSnapId(UUID symptomSnapId);
}
