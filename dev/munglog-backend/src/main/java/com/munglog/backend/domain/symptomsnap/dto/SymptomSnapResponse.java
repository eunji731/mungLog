package com.munglog.backend.domain.symptomsnap.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.munglog.backend.domain.symptomsnap.domain.SymptomSnap;
import com.munglog.backend.domain.symptomsnap.domain.SymptomSnapStatus;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Builder
public record SymptomSnapResponse(
        UUID id,
        UUID petId,
        LocalDate date,
        @JsonFormat(pattern = "HH:mm") LocalTime time,
        List<String> symptomTags,
        String memo,
        String photoUrl,
        SymptomSnapStatus status,
        UUID resolvedRecordId,
        String resolvedRecordTitle
) {
    public static SymptomSnapResponse from(SymptomSnap snap, List<String> symptomTags,
                                            String photoUrl, String resolvedRecordTitle) {
        return SymptomSnapResponse.builder()
                .id(snap.getId())
                .petId(snap.getPet().getId())
                .date(snap.getDate())
                .time(snap.getTime())
                .symptomTags(symptomTags)
                .memo(snap.getMemo())
                .photoUrl(photoUrl)
                .status(snap.getStatus())
                .resolvedRecordId(snap.getResolvedRecordId())
                .resolvedRecordTitle(resolvedRecordTitle)
                .build();
    }
}
