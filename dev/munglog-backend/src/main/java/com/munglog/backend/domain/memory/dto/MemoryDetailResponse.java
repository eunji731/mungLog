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

@Builder
public record MemoryDetailResponse(
        UUID id,
        LocalDate memoryDate,
        String aiTitle,
        String summary,
        String location,
        String energyLevel,
        String representativePhotoPath,
        List<UUID> petIds,
        List<MomentDetail> moments
) {

    @Builder
    public record MomentDetail(
            UUID id,
            String category,
            String aiTitle,
            String aiContent,
            String locationName,
            String energyLevel,
            List<String> tags,
            List<PhotoDetail> photos
    ) {}

    @Builder
    public record PhotoDetail(
            UUID id,
            String path,
            LocalDateTime takenAt,
            Double lat,
            Double lng
    ) {}

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

    private static PhotoDetail toPhotoDetail(Photo photo) {
        return PhotoDetail.builder()
                .id(photo.getId())
                .path(photo.getPathOrigin())
                .takenAt(photo.getTakenAt())
                .lat(photo.getGpsLat())
                .lng(photo.getGpsLng())
                .build();
    }

    private static List<String> parseTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(t -> !t.isEmpty())
                .toList();
    }

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
