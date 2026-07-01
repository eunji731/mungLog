package com.munglog.backend.domain.symptomsnap.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * 증상 스냅 진료 기록 연동 요청 DTO.
 * 증상 스냅을 특정 진료 기록과 연동할 때 사용하는 요청 클래스.
 */
@Getter
@NoArgsConstructor
public class SymptomSnapLinkRequest {

    /** 연동할 진료 기록 UUID */
    private UUID resolvedRecordId;
}
