package com.munglog.backend.domain.category.repository;

import com.munglog.backend.domain.category.domain.ScheduleCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScheduleCategoryRepository extends JpaRepository<ScheduleCategory, Long> {
    List<ScheduleCategory> findAllByIsActiveTrueOrderBySortOrderAsc();
    Optional<ScheduleCategory> findByCode(String code);
    boolean existsByCode(String code);
}
