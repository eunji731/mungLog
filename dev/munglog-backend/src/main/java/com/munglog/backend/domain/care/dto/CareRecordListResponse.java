package com.munglog.backend.domain.care.dto;

import com.munglog.backend.domain.care.domain.CareRecord;
import com.munglog.backend.domain.care.domain.CareRecordType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Builder
public record CareRecordListResponse(
        UUID id,
        UUID petId,
        String petName,
        CareRecordType recordType,
        LocalDate recordDate,
        String title,
        String note,
        int attachmentCount,
        BigDecimal amount,
        UUID relatedMedicalRecordId,
        String medicationStatus
) {
    public static CareRecordListResponse from(CareRecord record, int attachmentCount) {
        BigDecimal amount = null;
        UUID relatedMedicalRecordId = null;
        String medicationStatus = null;

        if (record.getMedicalDetail() != null) {
            amount = record.getMedicalDetail().getAmount();
            medicationStatus = Boolean.TRUE.equals(record.getMedicalDetail().getIsMedicationCompleted())
                    ? "COMPLETED" : "IN_PROGRESS";
        }
        if (record.getExpenseDetail() != null) {
            amount = record.getExpenseDetail().getAmount();
            relatedMedicalRecordId = record.getExpenseDetail().getRelatedMedicalRecordId();
        }

        return CareRecordListResponse.builder()
                .id(record.getId())
                .petId(record.getPet().getId())
                .petName(record.getPet().getName())
                .recordType(record.getRecordType())
                .recordDate(record.getRecordDate())
                .title(record.getTitle())
                .note(record.getNote())
                .attachmentCount(attachmentCount)
                .amount(amount)
                .relatedMedicalRecordId(relatedMedicalRecordId)
                .medicationStatus(medicationStatus)
                .build();
    }
}
