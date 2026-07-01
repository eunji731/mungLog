package com.munglog.backend.domain.symptom.repository;

import com.munglog.backend.domain.symptom.domain.SymptomMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SymptomMasterRepository extends JpaRepository<SymptomMaster, Long> {
    Optional<SymptomMaster> findByName(String name);
    List<SymptomMaster> findByNameContainingIgnoreCase(String keyword);
    List<SymptomMaster> findAllByOrderByIsActiveDescNameAsc();
}
