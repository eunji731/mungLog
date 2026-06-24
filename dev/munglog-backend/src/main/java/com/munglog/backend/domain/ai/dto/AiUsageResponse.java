package com.munglog.backend.domain.ai.dto;

import lombok.Builder;

@Builder
public record AiUsageResponse(
        long dateCount,
        long dateLimit,
        long dailyTotal,
        long dailyLimit,
        boolean dateBlocked,
        boolean dailyBlocked
) {}
