package com.munglog.backend.domain.ai.dto;

import lombok.Builder;
import java.util.List;

@Builder
public record PhotoDetailResponse(
        String fileName,
        List<String> themeTags,
        String photoComment,
        Integer vibeScore,
        Boolean isBest
) {}
