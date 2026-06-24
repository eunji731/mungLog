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
    public record MonthlyStats(int memoryCount, int visitedPlaceCount, double avgEnergyLevel) {}

    @Builder
    public record BestPhotoItem(UUID photoId, String photoUrl, String memoryDate) {}

    @Builder
    public record FavoritePlaceItem(String locationName, long visitCount) {}

    @Builder
    public record StreakInfo(int currentStreak, int longestStreak) {}
}
