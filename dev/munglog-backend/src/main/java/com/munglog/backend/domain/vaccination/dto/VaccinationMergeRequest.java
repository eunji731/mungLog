package com.munglog.backend.domain.vaccination.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class VaccinationMergeRequest {
    private Long sourceId;
    private Long targetId;
}
