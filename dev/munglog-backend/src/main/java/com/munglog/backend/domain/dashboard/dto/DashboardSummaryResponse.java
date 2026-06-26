package com.munglog.backend.domain.dashboard.dto;

import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record DashboardSummaryResponse(
        PetInfo pet,
        MonthlyStats monthlyStats,
        List<BestPhotoItem> bestPhotos,
        List<FavoritePlaceItem> favoritePlaces,
        StreakInfo streak
) {

    @Builder
    public record PetInfo(UUID id, String name, String profileImageUrl) {}

    @Builder
    public record MonthlyStats(int recordedDays, int visitedPlaces, int bestPhotosCount) {}

    @Builder
    public record BestPhotoItem(UUID photoId, String photoPath, String memoryDate, Integer vibeScore, String aiComment) {}

    @Builder
    public record FavoritePlaceItem(String locationName, long count) {}

    @Builder
    public record StreakInfo(int current, int longest) {}
}
