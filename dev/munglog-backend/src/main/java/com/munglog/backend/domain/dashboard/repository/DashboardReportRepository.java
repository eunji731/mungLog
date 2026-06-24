package com.munglog.backend.domain.dashboard.repository;

import com.munglog.backend.domain.dashboard.domain.DashboardReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DashboardReportRepository extends JpaRepository<DashboardReport, UUID> {
    Optional<DashboardReport> findByUser_IdAndPet_IdAndReportYearMonth(UUID userId, UUID petId, String yearMonth);
    Optional<DashboardReport> findByUser_IdAndPetIsNullAndReportYearMonth(UUID userId, String yearMonth);
}
