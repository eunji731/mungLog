package com.munglog.backend.domain.ai.dto;

import lombok.Builder;

@Builder
public record CheckMetadataResponse(
        String originalName,
        boolean hasDate,
        boolean hasGps
) {}
