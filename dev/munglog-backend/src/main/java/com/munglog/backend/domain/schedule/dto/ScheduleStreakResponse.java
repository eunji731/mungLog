package com.munglog.backend.domain.schedule.dto;

import com.munglog.backend.domain.schedule.domain.ScheduleType;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 일정 스트릭(연속 완료) 응답 DTO.
 * 동일 반려동물의 동일 제목 일정이 반복될 때 연속 완료 현황과
 * 다음 예상 일정, 재고 소진 예상일, 재고 경고 여부를 함께 제공한다.
 */
@Builder
public record ScheduleStreakResponse(
        /** 반려동물 UUID */
        UUID petId,
        /** 반려동물 이름 */
        String petName,
        /** 일정 제목 */
        String title,
        /** 일정 유형 */
        ScheduleType scheduleType,
        /** 동일 제목 일정 총 횟수 */
        int totalCount,
        /** 최근 연속 완료 횟수 */
        int streakCount,
        /** 마지막 일정 날짜 */
        LocalDateTime lastScheduleDate,
        /** 마지막 일정 완료 여부 */
        boolean lastCompleted,
        /** 평균 간격 기반 다음 예상 일정일 */
        LocalDateTime nextSuggestedDate,
        /** 최근 6회 이내 발생 이력 */
        List<Occurrence> recentOccurrences,
        /** 연결 용품 UUID */
        UUID inventoryItemId,
        /** 연결 용품 이름 */
        String inventoryItemName,
        /** 연결 용품 현재 재고 */
        Integer inventoryItemStock,
        /** 재고 소진 예상일 (재고 × 평균 간격) */
        LocalDateTime stockDepletionDate,
        /** 재고 부족 경고 여부 (재고 ≤ 1 또는 소진일이 45일 이내) */
        boolean lowStockWarning
) {
    /**
     * 개별 일정 발생 이력 레코드.
     *
     * @param scheduleDate 일정 날짜·시간
     * @param completed    완료 여부
     */
    public record Occurrence(LocalDateTime scheduleDate, boolean completed) {}
}
