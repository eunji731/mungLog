package com.munglog.backend.domain.ai.repository;

import com.munglog.backend.domain.ai.domain.AiDiaryUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * AI 사용 내역(AiDiaryUsage) 데이터 접근 인터페이스.
 * 날짜별·일별 사용 횟수 집계를 통해 사용량 제한 여부를 판단한다.
 */
public interface AiDiaryUsageRepository extends JpaRepository<AiDiaryUsage, UUID> {

    /**
     * [목적] 특정 회원의 특정 날짜에 대한 AI 사용 횟수를 조회한다.
     * [설명] 날짜별 분석 제한(DATE_LIMIT) 초과 여부를 판단하기 위해 사용된다.
     *        calledAt 범위는 오늘 하루(00:00 ~ 23:59)로 제한하여 당일 호출 횟수만 카운트한다.
     *
     * @param memberId   사용자 ID
     * @param usageType  AI 사용 유형 (예: ANALYZE)
     * @param targetDate 분석 대상 날짜
     * @param start      조회 시작 일시 (오늘 00:00:00)
     * @param end        조회 종료 일시 (오늘 23:59:59)
     * @return 조건에 해당하는 사용 내역 수
     */
    @Query("SELECT COUNT(u) FROM AiDiaryUsage u WHERE u.member.id = :memberId AND u.usageType = :usageType AND u.targetDate = :targetDate AND u.calledAt BETWEEN :start AND :end")
    long countByMember_IdAndUsageTypeAndTargetDateAndCalledAtBetween(
            @Param("memberId") UUID memberId,
            @Param("usageType") String usageType,
            @Param("targetDate") LocalDate targetDate,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    /**
     * [목적] 특정 회원의 오늘 하루 전체 AI 사용 횟수를 조회한다.
     * [설명] 일별 총량 제한(DAILY_LIMIT) 초과 여부를 판단하기 위해 사용된다.
     *        targetDate 조건 없이 오늘 호출된 전체 횟수를 카운트한다.
     *
     * @param memberId  사용자 ID
     * @param usageType AI 사용 유형 (예: DAILY, INVENTORY)
     * @param start     조회 시작 일시 (오늘 00:00:00)
     * @param end       조회 종료 일시 (오늘 23:59:59)
     * @return 조건에 해당하는 사용 내역 수
     */
    @Query("SELECT COUNT(u) FROM AiDiaryUsage u WHERE u.member.id = :memberId AND u.usageType = :usageType AND u.calledAt BETWEEN :start AND :end")
    long countByMember_IdAndUsageTypeAndCalledAtBetween(
            @Param("memberId") UUID memberId,
            @Param("usageType") String usageType,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
