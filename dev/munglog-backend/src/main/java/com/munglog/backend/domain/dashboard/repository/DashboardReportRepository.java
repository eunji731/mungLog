package com.munglog.backend.domain.dashboard.repository;

import com.munglog.backend.domain.dashboard.domain.DashboardReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * AI 대시보드 리포트 리포지토리.
 * 사용자/반려동물/연월 조합으로 AI 리포트를 조회하기 위한 JPA 리포지토리 인터페이스.
 */
public interface DashboardReportRepository extends JpaRepository<DashboardReport, UUID> {

    /**
     * [목적] 사용자·반려동물·연월 조합으로 리포트를 조회한다.
     * [설명] 특정 반려동물 기준 월간 리포트가 이미 생성되었는지 확인할 때 사용한다.
     *
     * @param userId       사용자 UUID
     * @param petId        반려동물 UUID
     * @param yearMonth    조회 연월 (예: "2025-07")
     * @return 조건에 맞는 리포트 (없으면 empty)
     */
    Optional<DashboardReport> findByUser_IdAndPet_IdAndReportYearMonth(UUID userId, UUID petId, String yearMonth);

    /**
     * [목적] 사용자·연월 조합으로 전체 그룹 기준 리포트를 조회한다.
     * [설명] petId가 null인 경우(그룹 전체 기준) 리포트를 조회한다.
     *
     * @param userId    사용자 UUID
     * @param yearMonth 조회 연월 (예: "2025-07")
     * @return 조건에 맞는 리포트 (없으면 empty)
     */
    Optional<DashboardReport> findByUser_IdAndPetIsNullAndReportYearMonth(UUID userId, String yearMonth);
}
