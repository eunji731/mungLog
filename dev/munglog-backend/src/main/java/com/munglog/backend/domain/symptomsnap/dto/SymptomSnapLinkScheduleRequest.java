package com.munglog.backend.domain.symptomsnap.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
public class SymptomSnapLinkScheduleRequest {
    private UUID linkedScheduleId;
}
