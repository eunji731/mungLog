package com.munglog.backend.domain.vaccination.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class VaccinationTypeCreateRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    private Integer intervalDays;
}
