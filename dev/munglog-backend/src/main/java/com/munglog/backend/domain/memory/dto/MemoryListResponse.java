package com.munglog.backend.domain.memory.dto;

import com.munglog.backend.domain.memory.domain.Memory;
import com.munglog.backend.domain.memory.domain.MemoryMoment;
import com.munglog.backend.domain.memory.domain.Photo;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Builder
public record MemoryListResponse(
        UUID id,
        LocalDate memoryDate,
        String aiTitle,
        String summary,
        String location,
        String energyLevel,
        PhotoInfo representativePhoto,
        List<MomentInfo> moments,
        List<UUID> petIds
) {

    @Builder
    public record PhotoInfo(
            UUID id,
            String url,
            String thumb300,
            boolean isBest
    ) {}

    @Builder
    public record MomentInfo(
            UUID id,
            String category,
            String aiTitle,
            String locationName,
            int photoCount
    ) {}

    public static MemoryListResponse from(Memory memory, String baseUrl) {
        List<MomentInfo> momentInfos = memory.getMoments().stream()
                .map(m -> MomentInfo.builder()
                        .id(m.getId())
                        .category(m.getCategory())
                        .aiTitle(m.getAiTitle())
                        .locationName(m.getLocationName())
                        .photoCount(m.getPhotos().size())
                        .build())
                .toList();

        List<UUID> petIds = memory.getMemoryDogs().stream()
                .map(md -> md.getDog().getId())
                .toList();

        PhotoInfo repPhoto = null;
        if (memory.getRepresentativePhoto() != null) {
            Photo p = memory.getRepresentativePhoto();
            repPhoto = PhotoInfo.builder()
                    .id(p.getId())
                    .url(p.getPathOrigin() != null ? baseUrl + "/" + p.getPathOrigin() : null)
                    .thumb300(p.getPathThumb300() != null ? baseUrl + "/" + p.getPathThumb300() : null)
                    .isBest(Boolean.TRUE.equals(p.getIsBest()))
                    .build();
        }

        return MemoryListResponse.builder()
                .id(memory.getId())
                .memoryDate(memory.getMemoryDate())
                .aiTitle(memory.getAiTitle())
                .summary(memory.getSummary())
                .location(memory.getLocation())
                .energyLevel(memory.getEnergyLevel())
                .representativePhoto(repPhoto)
                .moments(momentInfos)
                .petIds(petIds)
                .build();
    }
}
