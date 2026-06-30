package com.munglog.backend.domain.category.repository;

import com.munglog.backend.domain.category.domain.CareCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CareCategoryRepository extends JpaRepository<CareCategory, Long> {
    List<CareCategory> findAllByIsActiveTrueOrderBySortOrderAsc();
    Optional<CareCategory> findByCode(String code);
    boolean existsByCode(String code);
}
