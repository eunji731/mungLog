package com.munglog.backend.domain.ai.dto;

import lombok.Builder;
import java.util.List;
import java.util.UUID;

@Builder
public record MomentResponse(
        String category,
        String aiTitle,
        String aiContent,
        String energyLevel,
        String locationName,
        List<String> tags,
        List<UUID> targetPetIds,
        List<String> photoFileNames,
        String representativePhotoPath,
        List<PhotoDetailResponse> photoDetails
) {}
