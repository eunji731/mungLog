package com.munglog.backend.domain.ai.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * 제품 이미지 AI 분석 결과를 담는 DTO.
 * 각 필드는 AiField 래퍼로 감싸져 있어 추출 값(value), 신뢰도(confidence),
 * 후보 목록(candidates)을 함께 제공한다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyzeProductResult {
    /** 제품 카테고리 (예: 사료, 간식, 용품) */
    private AiField<String> category;
    /** 제품명 */
    private AiField<String> name;
    /** 브랜드명 */
    private AiField<String> brand;
    /** 맛 또는 향 */
    private AiField<String> flavor;
    /** 성분 목록 */
    private AiField<List<String>> ingredients;
    /** 소재 (용품류의 경우) */
    private AiField<String> material;
    /** 크기 또는 용량 */
    private AiField<String> size;
    /** 보관 방법 */
    private AiField<String> storageMethod;
    /** 제조 날짜 */
    private AiField<String> productionDate;
    /** 유통기한 (정확한 날짜 형식) */
    private AiField<String> expiryDateSpecific;
    /** 유통기한 (텍스트 형식, 예: "제조일로부터 1년") */
    private AiField<String> expiryDateText;
    /** 권장 사용 방법 또는 급여 방법 */
    private AiField<String> suggestedUsage;
    /** 사용자가 직접 검토해야 할 필드 이름 목록 */
    private List<String> reviewFields;
    /** AI가 감지한 주의사항 또는 경고 메시지 목록 */
    private List<String> warnings;

    /**
     * AI가 추출한 개별 필드 값을 신뢰도, 후보 목록과 함께 감싸는 제네릭 래퍼 클래스.
     * 클라이언트는 confidence가 낮거나 candidates가 여러 개인 필드를 사용자에게 재확인시킬 수 있다.
     *
     * @param <T> 필드 값의 타입 (String, List<String> 등)
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiField<T> {
        /** AI가 추출한 최종 값 */
        private T value;
        /** 0.0 ~ 1.0 범위의 추출 신뢰도 (1.0에 가까울수록 정확) */
        private Double confidence;
        /** 신뢰도가 낮을 때 제시되는 대안 후보 목록 */
        private List<T> candidates;
    }
}
