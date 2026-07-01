package com.munglog.backend.domain.dashboard.dto;

import lombok.Builder;

import java.util.List;
import java.util.UUID;

/**
 * 대시보드 요약 응답 DTO.
 * 특정 월의 반려동물 활동 통계, 베스트 사진, 즐겨찾는 장소, 연속 기록 스트릭을 담아 반환하는 레코드 클래스.
 *
 * @param pet            대상 반려동물 정보 (null이면 전체 기준)
 * @param monthlyStats   월간 통계 (기록일 수, 방문 장소 수, 베스트 사진 수)
 * @param bestPhotos     베스트 사진 목록 (최대 5개)
 * @param favoritePlaces 즐겨 찾는 장소 목록 (최대 5개)
 * @param streak         연속 기록 스트릭 정보
 */
@Builder
public record DashboardSummaryResponse(
        PetInfo pet,
        MonthlyStats monthlyStats,
        List<BestPhotoItem> bestPhotos,
        List<FavoritePlaceItem> favoritePlaces,
        StreakInfo streak
) {

    /**
     * 대상 반려동물 기본 정보.
     *
     * @param id              반려동물 UUID
     * @param name            반려동물 이름
     * @param profileImageUrl 프로필 이미지 URL
     */
    @Builder
    public record PetInfo(UUID id, String name, String profileImageUrl) {}

    /**
     * 월간 통계 정보.
     *
     * @param recordedDays    해당 월 기록된 날 수
     * @param visitedPlaces   해당 월 방문한 장소 수
     * @param bestPhotosCount 베스트 사진 수
     */
    @Builder
    public record MonthlyStats(int recordedDays, int visitedPlaces, int bestPhotosCount) {}

    /**
     * 베스트 사진 아이템.
     *
     * @param photoId    사진 UUID
     * @param photoPath  사진 URL
     * @param memoryDate 기록 날짜
     * @param vibeScore  AI 감성 점수
     * @param aiComment  AI 코멘트
     */
    @Builder
    public record BestPhotoItem(UUID photoId, String photoPath, String memoryDate, Integer vibeScore, String aiComment) {}

    /**
     * 즐겨 찾는 장소 아이템.
     *
     * @param locationName 장소명
     * @param count        방문 횟수
     */
    @Builder
    public record FavoritePlaceItem(String locationName, long count) {}

    /**
     * 연속 기록 스트릭 정보.
     *
     * @param current 현재 연속 기록 일수
     * @param longest 역대 최장 연속 기록 일수
     */
    @Builder
    public record StreakInfo(int current, int longest) {}
}
