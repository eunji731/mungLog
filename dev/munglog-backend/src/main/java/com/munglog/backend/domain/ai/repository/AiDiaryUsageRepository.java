package com.munglog.backend.domain.ai.repository;

import com.munglog.backend.domain.ai.domain.AiDiaryUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public interface AiDiaryUsageRepository extends JpaRepository<AiDiaryUsage, UUID> {

    @Query("SELECT COUNT(u) FROM AiDiaryUsage u WHERE u.member.id = :memberId AND u.usageType = :usageType AND u.targetDate = :targetDate")
    long countByMember_IdAndUsageTypeAndTargetDate(
            @Param("memberId") UUID memberId,
            @Param("usageType") String usageType,
            @Param("targetDate") LocalDate targetDate);

    @Query("SELECT COUNT(u) FROM AiDiaryUsage u WHERE u.member.id = :memberId AND u.usageType = :usageType AND u.calledAt BETWEEN :start AND :end")
    long countByMember_IdAndUsageTypeAndCalledAtBetween(
            @Param("memberId") UUID memberId,
            @Param("usageType") String usageType,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
