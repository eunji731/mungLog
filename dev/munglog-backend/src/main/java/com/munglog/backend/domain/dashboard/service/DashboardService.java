package com.munglog.backend.domain.dashboard.service;

import com.munglog.backend.common.file.service.FileStorageService;
import com.munglog.backend.domain.dashboard.dto.DashboardSummaryResponse;
import com.munglog.backend.domain.family.service.FamilyGroupService;
import com.munglog.backend.domain.memory.domain.Photo;
import com.munglog.backend.domain.memory.repository.MemoryMomentRepository;
import com.munglog.backend.domain.memory.repository.MemoryRepository;
import com.munglog.backend.domain.memory.repository.PhotoRepository;
import com.munglog.backend.domain.pet.domain.Pet;
import com.munglog.backend.domain.pet.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PetRepository petRepository;
    private final MemoryRepository memoryRepository;
    private final MemoryMomentRepository memoryMomentRepository;
    private final PhotoRepository photoRepository;
    private final FileStorageService fileStorageService;
    private final FamilyGroupService familyGroupService;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(UUID userId, UUID petId, String yearMonth) {
        UUID groupId = familyGroupService.findGroupIdByUserId(userId).orElse(null);
        if (groupId == null) {
            return DashboardSummaryResponse.builder()
                    .monthlyStats(DashboardSummaryResponse.MonthlyStats.builder().recordedDays(0).visitedPlaces(0).bestPhotosCount(0).build())
                    .bestPhotos(List.of())
                    .favoritePlaces(List.of())
                    .streak(DashboardSummaryResponse.StreakInfo.builder().current(0).longest(0).build())
                    .build();
        }
        Pet pet = petId != null ? petRepository.findById(petId).orElse(null) : null;

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth;
        LocalDate endOfMonth;
        try {
            YearMonth ym = (yearMonth != null && !yearMonth.isBlank()) ? YearMonth.parse(yearMonth) : YearMonth.from(now);
            startOfMonth = ym.atDay(1);
            endOfMonth = ym.atEndOfMonth();
        } catch (DateTimeParseException e) {
            startOfMonth = now.withDayOfMonth(1);
            endOfMonth = now.withDayOfMonth(now.lengthOfMonth());
        }

        long memoryCount = pet != null
                ? memoryRepository.countByGroupAndDateRangeAndPet(groupId, pet.getId(), startOfMonth, endOfMonth)
                : memoryRepository.findByGroupIdAndMemoryDateBetween(groupId, startOfMonth, endOfMonth).size();

        long visitedPlaceCount = pet != null
                ? memoryMomentRepository.countDistinctVisitedPlacesByGroupAndPet(groupId, pet.getId(), startOfMonth, endOfMonth)
                : memoryMomentRepository.countDistinctVisitedPlacesByGroup(groupId, startOfMonth, endOfMonth);

        List<Photo> bestPhotos = pet != null
                ? photoRepository.findBestPhotosByGroupAndPet(groupId, pet.getId())
                : photoRepository.findBestPhotosByGroup(groupId);
        List<DashboardSummaryResponse.BestPhotoItem> bestPhotoItems = bestPhotos.stream()
                .limit(5)
                .map(p -> DashboardSummaryResponse.BestPhotoItem.builder()
                        .photoId(p.getId())
                        .photoPath(resolveUrl(p.getPathThumb300() != null ? p.getPathThumb300() : p.getPathOrigin()))
                        .memoryDate(p.getMemory().getMemoryDate() != null ? p.getMemory().getMemoryDate().toString() : null)
                        .vibeScore(p.getVibeScore())
                        .aiComment(p.getAiComment())
                        .build())
                .toList();

        List<Object[]> favoriteRows = pet != null
                ? memoryMomentRepository.findFavoritePlacesByGroupAndPet(groupId, pet.getId())
                : memoryMomentRepository.findFavoritePlacesByGroup(groupId);
        List<DashboardSummaryResponse.FavoritePlaceItem> favoritePlaces = favoriteRows.stream()
                .limit(5)
                .map(row -> DashboardSummaryResponse.FavoritePlaceItem.builder()
                        .locationName((String) row[0])
                        .count(((Number) row[1]).longValue())
                        .build())
                .toList();

        List<LocalDate> dates = pet != null
                ? memoryRepository.findAllMemoryDatesByGroupIdAndPetOrderByDesc(groupId, pet.getId())
                : memoryRepository.findAllMemoryDatesByGroupIdOrderByDesc(groupId);
        int currentStreak = calculateCurrentStreak(dates, now);
        int longestStreak = calculateLongestStreak(dates);

        DashboardSummaryResponse.PetInfo petInfo = pet != null
                ? DashboardSummaryResponse.PetInfo.builder()
                .id(pet.getId()).name(pet.getName())
                .profileImageUrl(resolveUrl(pet.getProfileImagePath()))
                .build() : null;

        return DashboardSummaryResponse.builder()
                .pet(petInfo)
                .monthlyStats(DashboardSummaryResponse.MonthlyStats.builder()
                        .recordedDays((int) memoryCount)
                        .visitedPlaces((int) visitedPlaceCount)
                        .bestPhotosCount(bestPhotoItems.size())
                        .build())
                .bestPhotos(bestPhotoItems)
                .favoritePlaces(favoritePlaces)
                .streak(DashboardSummaryResponse.StreakInfo.builder()
                        .current(currentStreak).longest(longestStreak).build())
                .build();
    }

    private int calculateCurrentStreak(List<LocalDate> dates, LocalDate today) {
        if (dates.isEmpty()) return 0;
        int streak = 0;
        LocalDate expected = today;
        for (LocalDate date : dates) {
            if (date.equals(expected)) {
                streak++;
                expected = expected.minusDays(1);
            } else if (date.isBefore(expected)) {
                break;
            }
        }
        return streak;
    }

    private int calculateLongestStreak(List<LocalDate> dates) {
        if (dates.isEmpty()) return 0;
        int longest = 1, current = 1;
        for (int i = 1; i < dates.size(); i++) {
            if (dates.get(i - 1).minusDays(1).equals(dates.get(i))) {
                current++;
                longest = Math.max(longest, current);
            } else {
                current = 1;
            }
        }
        return longest;
    }

    private String resolveUrl(String path) {
        return path != null ? fileStorageService.getFileUrl(path) : null;
    }
}
