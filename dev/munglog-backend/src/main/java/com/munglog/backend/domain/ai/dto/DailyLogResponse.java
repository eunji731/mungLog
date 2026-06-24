package com.munglog.backend.domain.ai.dto;

import lombok.Builder;
import java.util.List;

@Builder
public record DailyLogResponse(
        String aiTitle,
        String aiSummary,
        String representativePhotoPath,
        List<MomentResponse> moments
) {}
