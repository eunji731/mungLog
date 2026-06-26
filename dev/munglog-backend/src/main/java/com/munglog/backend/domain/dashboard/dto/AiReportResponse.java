package com.munglog.backend.domain.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.munglog.backend.domain.dashboard.domain.DashboardReport;
import lombok.Builder;

@Builder
public record AiReportResponse(
        boolean hasData,
        String reportYearMonth,
        String generatedAt,
        Integer recordCount,
        Integer remainingRefreshCount,
        @JsonRawValue String monthlyReport,
        @JsonRawValue String personalityInsight,
        @JsonRawValue String activityInsight,
        @JsonRawValue String locationInsight,
        String guardianMessage,
        String nextSuggestion
) {
    public static AiReportResponse from(DashboardReport report, int recordCount, int remainingRefreshCount) {
        if (report == null) return AiReportResponse.builder()
                .hasData(false)
                .recordCount(recordCount)
                .remainingRefreshCount(remainingRefreshCount)
                .build();
        return AiReportResponse.builder()
                .hasData(true)
                .reportYearMonth(report.getReportYearMonth())
                .generatedAt(report.getCreatedAt() != null ? report.getCreatedAt().toString() : null)
                .recordCount(recordCount)
                .remainingRefreshCount(remainingRefreshCount)
                .monthlyReport(report.getMonthlyReport())
                .personalityInsight(report.getPersonalityInsight())
                .activityInsight(report.getActivityInsight())
                .locationInsight(report.getLocationInsight())
                .guardianMessage(report.getGuardianMessage())
                .nextSuggestion(report.getNextSuggestion())
                .build();
    }
}
