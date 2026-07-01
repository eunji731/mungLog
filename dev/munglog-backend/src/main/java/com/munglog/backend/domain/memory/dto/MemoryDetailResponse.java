package com.munglog.backend.domain.memory.dto;

import com.munglog.backend.domain.memory.domain.Memory;
import com.munglog.backend.domain.memory.domain.MemoryMoment;
import com.munglog.backend.domain.memory.domain.Photo;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 일지 상세 응답 DTO.
 * 일지 상세 조회 API에서 반환하는 데이터를 담는 레코드 클래스.
 * 주요 기능: Memory 엔티티와 연관된 순간(Moment), 사진(Photo), 반려동물 ID 목록을 포함
 */
@Builder
public record MemoryDetailResponse(
        /** 일지의 고유 식별자 */
        UUID id,
        /** 일지 날짜 */
        LocalDate memoryDate,
        /** AI가 생성한 일지 제목 */
        String aiTitle,
        /** 일지 요약 내용 */
        String summary,
        /** 활동 장소 */
        String location,
        /** 에너지 레벨 (예: HIGH, MEDIUM, LOW) */
        String energyLevel,
        /** 대표 사진의 원본 파일 경로 */
        String representativePhotoPath,
        /** 이 일지에 등장한 반려동물 UUID 목록 */
        List<UUID> petIds,
        /** 일지에 포함된 순간(활동 장면) 목록 */
        List<MomentDetail> moments
) {

    /**
     * 순간(Moment) 상세 정보 DTO.
     * 일지 내 하나의 활동 장면에 대한 상세 정보를 담는다.
     */
    @Builder
    public record MomentDetail(
            /** 순간의 고유 식별자 */
            UUID id,
            /** 활동 카테고리 */
            String category,
            /** AI가 생성한 순간 제목 */
            String aiTitle,
            /** AI가 생성한 순간 상세 내용 */
            String aiContent,
            /** 장소 이름 */
            String locationName,
            /** 에너지 레벨 */
            String energyLevel,
            /** 태그 목록 (쉼표 구분 문자열에서 파싱) */
            List<String> tags,
            /** 이 순간에 속한 사진 목록 */
            List<PhotoDetail> photos
    ) {}

    /**
     * 사진 기본 정보 DTO.
     * 일지 상세에서 사진을 표시하는 데 필요한 최소 정보를 담는다.
     */
    @Builder
    public record PhotoDetail(
            /** 사진의 고유 식별자 */
            UUID id,
            /** 원본 사진 파일 경로 */
            String path,
            /** 사진 촬영 시각 */
            LocalDateTime takenAt,
            /** GPS 위도 */
            Double lat,
            /** GPS 경도 */
            Double lng
    ) {}

    /**
     * [목적] Memory 엔티티를 MemoryDetailResponse DTO로 변환
     * [설명] 일지에 연결된 순간, 사진, 반려동물 정보를 모두 조합하여 응답 DTO를 생성한다.
     *        대표 사진은 representativePhoto 필드를 우선 사용하고, 없으면 첫 번째 사진을 사용한다.
     *
     * @param memory 변환할 Memory 엔티티 (moments, memoryDogs가 로드된 상태)
     * @return 변환된 MemoryDetailResponse DTO
     */
    public static MemoryDetailResponse from(Memory memory) {
        List<UUID> petIds = memory.getMemoryDogs().stream()
                .map(md -> md.getDog().getId())
                .toList();

        List<MomentDetail> momentDetails = memory.getMoments().stream()
                .map(MemoryDetailResponse::toMomentDetail)
                .toList();

        return MemoryDetailResponse.builder()
                .id(memory.getId())
                .memoryDate(memory.getMemoryDate())
                .aiTitle(memory.getAiTitle())
                .summary(memory.getSummary())
                .location(memory.getLocation())
                .energyLevel(memory.getEnergyLevel())
                .representativePhotoPath(resolveRepresentativePhotoPath(memory))
                .petIds(petIds)
                .moments(momentDetails)
                .build();
    }

    /**
     * [목적] MemoryMoment 엔티티를 MomentDetail DTO로 변환
     * [설명] 태그 문자열을 파싱하고 사진 목록을 변환하여 MomentDetail을 생성한다.
     *
     * @param moment 변환할 MemoryMoment 엔티티
     * @return 변환된 MomentDetail DTO
     */
    private static MomentDetail toMomentDetail(MemoryMoment moment) {
        List<String> tags = parseTags(moment.getTags());
        List<PhotoDetail> photos = moment.getPhotos().stream()
                .map(MemoryDetailResponse::toPhotoDetail)
                .toList();

        return MomentDetail.builder()
                .id(moment.getId())
                .category(moment.getCategory())
                .aiTitle(moment.getAiTitle())
                .aiContent(moment.getAiContent())
                .locationName(moment.getLocationName())
                .energyLevel(moment.getEnergyLevel())
                .tags(tags)
                .photos(photos)
                .build();
    }

    /**
     * [목적] Photo 엔티티를 PhotoDetail DTO로 변환
     * [설명] 사진 표시에 필요한 최소 정보(경로, 촬영 시각, GPS 좌표)만 추출한다.
     *
     * @param photo 변환할 Photo 엔티티
     * @return 변환된 PhotoDetail DTO
     */
    private static PhotoDetail toPhotoDetail(Photo photo) {
        return PhotoDetail.builder()
                .id(photo.getId())
                .path(photo.getPathOrigin())
                .takenAt(photo.getTakenAt())
                .lat(photo.getGpsLat())
                .lng(photo.getGpsLng())
                .build();
    }

    /**
     * [목적] 쉼표로 구분된 태그 문자열을 List로 파싱
     * [설명] DB에 "산책,공원,맑음" 형태로 저장된 태그를 ["산책", "공원", "맑음"] 리스트로 변환한다.
     *        null이거나 빈 문자열이면 빈 리스트를 반환한다.
     *
     * @param tags 쉼표 구분 태그 문자열
     * @return 파싱된 태그 목록 (공백 제거됨)
     */
    private static List<String> parseTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(t -> !t.isEmpty())
                .toList();
    }

    /**
     * [목적] 일지의 대표 사진 경로를 결정
     * [설명] representativePhoto 필드를 우선 사용하고, 없으면 순간들 중 첫 번째 사진의 경로를 반환한다.
     *
     * @param memory 대표 사진을 찾을 Memory 엔티티
     * @return 대표 사진 파일 경로, 사진이 없으면 null
     */
    private static String resolveRepresentativePhotoPath(Memory memory) {
        if (memory.getRepresentativePhoto() != null) {
            return memory.getRepresentativePhoto().getPathOrigin();
        }
        return memory.getMoments().stream()
                .flatMap(m -> m.getPhotos().stream())
                .findFirst()
                .map(Photo::getPathOrigin)
                .orElse(null);
    }
}
