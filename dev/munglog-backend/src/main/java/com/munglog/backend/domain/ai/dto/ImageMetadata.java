package com.munglog.backend.domain.ai.dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record ImageMetadata(
        String fileName,
        LocalDateTime takenAt,
        Double latitude,
        Double longitude
) {}
