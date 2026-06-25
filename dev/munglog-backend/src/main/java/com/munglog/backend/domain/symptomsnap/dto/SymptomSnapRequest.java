package com.munglog.backend.domain.symptomsnap.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor
public class SymptomSnapRequest {
    private UUID petId;
    private LocalDate date;
    private LocalTime time;
    private List<String> symptomTags;
    private String memo;
}
