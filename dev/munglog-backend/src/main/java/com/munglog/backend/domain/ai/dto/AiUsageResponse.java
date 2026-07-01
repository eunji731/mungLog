package com.munglog.backend.domain.ai.dto;

import lombok.Builder;

/**
 * AI 기능 사용량 현황을 클라이언트에 전달하는 응답 DTO.
 * 날짜별 분석 횟수와 일일 전체 사용 횟수, 각각의 제한 초과 여부를 포함한다.
 */
@Builder
public record AiUsageResponse(
        /** 오늘 해당 날짜(targetDate)에 대한 분석 사용 횟수 */
        long dateCount,
        /** 날짜별 최대 허용 분석 횟수 */
        long dateLimit,
        /** 오늘 하루 동안의 전체 AI 사용 횟수 */
        long dailyTotal,
        /** 하루 최대 허용 AI 사용 횟수 */
        long dailyLimit,
        /** 날짜별 제한 초과 여부 (true이면 해당 날짜 추가 분석 불가) */
        boolean dateBlocked,
        /** 일별 제한 초과 여부 (true이면 오늘 더 이상 AI 사용 불가) */
        boolean dailyBlocked
) {}
