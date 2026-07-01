package com.munglog.backend.domain.vaccination.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 예방접종 종류 병합 요청 DTO.
 * 두 접종 종류를 병합할 때 소스 ID와 대상 ID를 전달하는 요청 클래스.
 * sourceId가 targetId로 흡수되어 비활성화된다.
 */
@Getter
@NoArgsConstructor
public class VaccinationMergeRequest {

    /** 병합될(비활성화될) 소스 접종 종류 ID */
    private Long sourceId;

    /** 병합 대상(유지될) 접종 종류 ID */
    private Long targetId;
}
