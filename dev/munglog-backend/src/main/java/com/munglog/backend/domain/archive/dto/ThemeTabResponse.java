package com.munglog.backend.domain.archive.dto;

import lombok.Builder;

@Builder
public record ThemeTabResponse(
        String tag,
        long count,
        String representativePhotoUrl
) {}
