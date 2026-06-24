package com.munglog.backend.domain.archive.dto;

import com.munglog.backend.domain.memory.domain.Photo;
import com.munglog.backend.domain.memory.domain.PhotoThemeTag;
import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record ArchivePhotoResponse(
        UUID photoId,
        String photoUrl,
        String memoryDate,
        String memoryTitle,
        UUID memoryId,
        Boolean isBest,
        Integer vibeScore,
        String aiComment,
        List<String> themeTags
) {
    public static ArchivePhotoResponse from(Photo photo, String photoUrl, List<String> tags) {
        return ArchivePhotoResponse.builder()
                .photoId(photo.getId())
                .photoUrl(photoUrl)
                .memoryDate(photo.getMemory().getMemoryDate() != null ? photo.getMemory().getMemoryDate().toString() : null)
                .memoryTitle(photo.getMemory().getAiTitle())
                .memoryId(photo.getMemory().getId())
                .isBest(photo.getIsBest())
                .vibeScore(photo.getVibeScore())
                .aiComment(photo.getAiComment())
                .themeTags(tags)
                .build();
    }
}
