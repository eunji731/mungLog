package com.munglog.backend.domain.vaccination.dto;

import com.munglog.backend.domain.vaccination.domain.VaccinationAlias;
import lombok.Builder;

/**
 * 예방접종 별칭 매칭 응답 DTO.
 * 별칭 검색 시 매칭된 접종 종류 정보를 API 응답으로 전달하는 record 클래스.
 *
 * @param vaccinationTypeId   매칭된 접종 종류 ID
 * @param vaccinationTypeName 매칭된 접종 종류명
 * @param intervalDays        접종 권장 주기 (일 단위)
 * @param matchedAlias        실제 매칭된 별칭 문자열
 */
@Builder
public record VaccinationAliasMatchResponse(
        Long vaccinationTypeId,
        String vaccinationTypeName,
        Integer intervalDays,
        String matchedAlias
) {
    /**
     * [목적] VaccinationAlias 엔티티를 응답 DTO로 변환한다.
     *
     * @param alias 변환할 접종 별칭 엔티티
     * @return 접종 별칭 매칭 응답 DTO
     */
    public static VaccinationAliasMatchResponse from(VaccinationAlias alias) {
        return VaccinationAliasMatchResponse.builder()
                .vaccinationTypeId(alias.getVaccinationType().getId())
                .vaccinationTypeName(alias.getVaccinationType().getName())
                .intervalDays(alias.getVaccinationType().getIntervalDays())
                .matchedAlias(alias.getAlias())
                .build();
    }
}
