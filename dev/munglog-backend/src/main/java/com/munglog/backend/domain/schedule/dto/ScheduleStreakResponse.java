package com.munglog.backend.domain.schedule.dto;

import com.munglog.backend.domain.schedule.domain.ScheduleType;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record ScheduleStreakResponse(
        UUID petId,
        String petName,
        String title,
        ScheduleType scheduleType,
        int totalCount,
        int streakCount,
        LocalDateTime lastScheduleDate,
        boolean lastCompleted,
        LocalDateTime nextSuggestedDate,
        List<Occurrence> recentOccurrences,
        UUID inventoryItemId,
        String inventoryItemName,
        Integer inventoryItemStock,
        LocalDateTime stockDepletionDate,
        boolean lowStockWarning
) {
    public record Occurrence(LocalDateTime scheduleDate, boolean completed) {}
}
