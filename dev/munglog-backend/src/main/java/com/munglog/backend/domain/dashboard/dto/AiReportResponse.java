package com.munglog.backend.domain.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.munglog.backend.domain.dashboard.domain.DashboardReport;
import lombok.Builder;

/**
 * AI 월간 리포트 응답 DTO.
 * AI가 생성한 월간 분석 리포트를 클라이언트에 반환할 때 사용하는 레코드 클래스.
 * monthlyReport, personalityInsight 등은 JSON 문자열이므로 @JsonRawValue로 직렬화한다.
 *
 * @param hasData                리포트 데이터 존재 여부
 * @param reportYearMonth        리포트 대상 연월
 * @param generatedAt            리포트 생성 시각
 * @param recordCount            해당 월 기록 수
 * @param remainingRefreshCount  오늘 남은 갱신 횟수
 * @param monthlyReport          월간 요약 리포트 (JSON Raw)
 * @param personalityInsight     성향 인사이트 (JSON Raw)
 * @param activityInsight        활동 인사이트 (JSON Raw)
 * @param locationInsight        장소 인사이트 (JSON Raw)
 * @param guardianMessage        보호자 메시지
 * @param nextSuggestion         다음 달 활동 추천
 */
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
    /**
     * [목적] DashboardReport 엔티티를 AiReportResponse로 변환한다.
     * [설명] report가 null이면 hasData = false인 빈 응답을 반환한다.
     *        report가 있으면 모든 필드를 채워 반환한다.
     *
     * @param report                저장된 AI 리포트 엔티티 (null 가능)
     * @param recordCount           해당 월 기록 수
     * @param remainingRefreshCount 오늘 남은 갱신 횟수
     * @return AI 리포트 응답 DTO
     */
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
