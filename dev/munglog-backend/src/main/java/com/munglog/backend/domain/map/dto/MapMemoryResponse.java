package com.munglog.backend.domain.map.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record MapMemoryResponse(
        UUID photoId,
        String path,
        LocalDateTime takenAt,
        Double latitude,
        Double longitude,
        MemoryInfo moment,
        DailyLogInfo dailyLog
) {
    @Builder
    public record MemoryInfo(UUID id, String category, String aiTitle, String locationName) {}

    @Builder
    public record DailyLogInfo(UUID id, String dateKey, String aiTitle) {}
}
