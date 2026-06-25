package com.munglog.backend.domain.ai.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyzeProductResult {
    private AiField<String> category;
    private AiField<String> name;
    private AiField<String> brand;
    private AiField<String> flavor;
    private AiField<List<String>> ingredients;
    private AiField<String> material;
    private AiField<String> size;
    private AiField<String> storageMethod;
    private AiField<String> productionDate;
    private AiField<String> expiryDateSpecific;
    private AiField<String> expiryDateText;
    private AiField<String> suggestedUsage;
    private List<String> reviewFields;
    private List<String> warnings;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiField<T> {
        private T value;
        private Double confidence;
        private List<T> candidates;
    }
}
