package com.munglog.backend.domain.vaccination.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 예방접종 종류 생성/수정 요청 DTO.
 * 접종 종류명과 접종 주기를 전달하는 요청 클래스.
 */
@Getter
@NoArgsConstructor
public class VaccinationTypeCreateRequest {

    /** 접종 종류명 (필수, 최대 100자) */
    @NotBlank
    @Size(max = 100)
    private String name;

    /** 접종 권장 주기 (일 단위, 선택) */
    private Integer intervalDays;
}
