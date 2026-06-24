package com.munglog.backend.domain.ai.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyzeProductResult {
    private AiField<String> category;
    private AiField<String> name;
    private AiField<String> brand;
    private AiField<String> flavor;
    private AiField<String> ingredients;
    private AiField<String> material;
    private AiField<String> size;
    private AiField<String> storageMethod;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiField<T> {
        private T value;
        private Double confidence;
    }
}
