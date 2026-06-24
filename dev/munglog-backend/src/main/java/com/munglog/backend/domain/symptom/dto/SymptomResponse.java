package com.munglog.backend.domain.symptom.dto;

import com.munglog.backend.domain.symptom.domain.SymptomMaster;
import lombok.Builder;

@Builder
public record SymptomResponse(Long id, String name) {
    public static SymptomResponse from(SymptomMaster symptom) {
        return SymptomResponse.builder().id(symptom.getId()).name(symptom.getName()).build();
    }
}
