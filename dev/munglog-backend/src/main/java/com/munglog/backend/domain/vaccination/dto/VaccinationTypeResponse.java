package com.munglog.backend.domain.vaccination.dto;

import com.munglog.backend.domain.vaccination.domain.VaccinationType;
import lombok.Builder;

@Builder
public record VaccinationTypeResponse(
        Long id,
        String name,
        Integer intervalDays,
        boolean isActive,
        boolean isGlobal
) {
    public static VaccinationTypeResponse from(VaccinationType v) {
        return VaccinationTypeResponse.builder()
                .id(v.getId())
                .name(v.getName())
                .intervalDays(v.getIntervalDays())
                .isActive(v.getIsActive())
                .isGlobal(v.getGroup() == null)
                .build();
    }
}
