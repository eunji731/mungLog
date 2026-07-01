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

/**
 * 대시보드 요약 서비스.
 * 반려동물의 월간 통계(기록일 수, 방문 장소, 베스트 사진, 즐겨찾는 장소, 연속 기록 스트릭)를 계산하는 클래스.
 * 주요 기능: 월간 대시보드 요약 데이터 조회
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PetRepository petRepository;
    private final MemoryRepository memoryRepository;
    private final MemoryMomentRepository memoryMomentRepository;
    private final PhotoRepository photoRepository;
    private final FileStorageService fileStorageService;
    private final FamilyGroupService familyGroupService;

    /**
     * [목적] 특정 월의 대시보드 요약 데이터를 조회하여 반환한다.
     * [설명] 그룹에 속하지 않은 사용자는 빈 응답을 반환한다.
     *        petId가 null이면 그룹 전체 기준, yearMonth가 null이거나 잘못된 형식이면 현재 월 기준으로 처리한다.
     *        베스트 사진과 즐겨찾는 장소는 최대 5개씩 반환한다.
     *
     * @param userId    사용자 UUID
     * @param petId     반려동물 UUID (null이면 전체 기준)
     * @param yearMonth 조회 연월 (예: "2025-07", null이면 현재 월)
     * @return 대시보드 요약 응답
     */
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

    /**
     * [목적] 오늘부터 역순으로 연속 기록 일수(현재 스트릭)를 계산한다.
     * [설명] 날짜 목록은 내림차순으로 정렬되어야 한다.
     *        오늘 또는 어제부터 연속으로 기록이 있는 날을 카운트한다.
     *
     * @param dates 기억 날짜 목록 (내림차순 정렬)
     * @param today 오늘 날짜
     * @return 현재 연속 기록 일수
     */
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

    /**
     * [목적] 역대 최장 연속 기록 일수를 계산한다.
     * [설명] 날짜 목록은 내림차순으로 정렬되어야 한다.
     *        연속된 날짜가 끊기면 현재 스트릭을 초기화하고 최장값을 갱신한다.
     *
     * @param dates 기억 날짜 목록 (내림차순 정렬)
     * @return 역대 최장 연속 기록 일수
     */
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

    /**
     * [목적] 파일 경로를 URL로 변환한다.
     * [설명] path가 null이면 null을 반환한다.
     *
     * @param path 파일 경로
     * @return 접근 가능한 파일 URL 또는 null
     */
    private String resolveUrl(String path) {
        return path != null ? fileStorageService.getFileUrl(path) : null;
    }
}
