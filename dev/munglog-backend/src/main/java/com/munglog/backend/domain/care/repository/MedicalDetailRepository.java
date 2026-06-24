package com.munglog.backend.domain.care.repository;

import com.munglog.backend.domain.care.domain.MedicalDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MedicalDetailRepository extends JpaRepository<MedicalDetail, UUID> {
}
