package com.munglog.backend.domain.vaccination.dto;

import com.munglog.backend.domain.vaccination.domain.VaccinationAlias;
import lombok.Builder;

@Builder
public record VaccinationAliasMatchResponse(
        Long vaccinationTypeId,
        String vaccinationTypeName,
        Integer intervalDays,
        String matchedAlias
) {
    public static VaccinationAliasMatchResponse from(VaccinationAlias alias) {
        return VaccinationAliasMatchResponse.builder()
                .vaccinationTypeId(alias.getVaccinationType().getId())
                .vaccinationTypeName(alias.getVaccinationType().getName())
                .intervalDays(alias.getVaccinationType().getIntervalDays())
                .matchedAlias(alias.getAlias())
                .build();
    }
}
