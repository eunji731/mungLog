package com.munglog.backend.domain.dashboard.dto;

import com.munglog.backend.domain.dashboard.domain.DashboardReport;
import lombok.Builder;

@Builder
public record AiReportResponse(
        boolean hasData,
        String monthlyReport,
        String personalityInsight,
        String activityInsight,
        String locationInsight,
        String guardianMessage,
        String nextSuggestion
) {
    public static AiReportResponse from(DashboardReport report) {
        if (report == null) return AiReportResponse.builder().hasData(false).build();
        return AiReportResponse.builder()
                .hasData(true)
                .monthlyReport(report.getMonthlyReport())
                .personalityInsight(report.getPersonalityInsight())
                .activityInsight(report.getActivityInsight())
                .locationInsight(report.getLocationInsight())
                .guardianMessage(report.getGuardianMessage())
                .nextSuggestion(report.getNextSuggestion())
                .build();
    }
}
