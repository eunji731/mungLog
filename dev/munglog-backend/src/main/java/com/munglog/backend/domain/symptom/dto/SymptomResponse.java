package com.munglog.backend.domain.symptom.dto;

import com.munglog.backend.domain.symptom.domain.SymptomMaster;
import lombok.Builder;

/**
 * 증상 응답 DTO.
 * 증상 마스터 정보를 API 응답으로 전달하는 record 클래스.
 *
 * @param id       증상 ID
 * @param name     증상명
 * @param isActive 활성 여부
 */
@Builder
public record SymptomResponse(Long id, String name, Boolean isActive) {

    /**
     * [목적] SymptomMaster 엔티티를 응답 DTO로 변환한다.
     *
     * @param symptom 변환할 증상 마스터 엔티티
     * @return 증상 응답 DTO
     */
    public static SymptomResponse from(SymptomMaster symptom) {
        return SymptomResponse.builder()
                .id(symptom.getId())
                .name(symptom.getName())
                .isActive(symptom.getIsActive())
                .build();
    }
}
