package com.munglog.backend.domain.care.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor
public class CareRecordCreateRequest {
    private UUID petId;
    private String recordType;
    private LocalDate recordDate;
    private String title;
    private String note;
    private UUID sourceScheduleId;
    private List<UUID> fileIds;
    private MedicalDetailRequest medicalDetail;
    private ExpenseDetailRequest expenseDetail;

    @Getter
    @NoArgsConstructor
    public static class MedicalDetailRequest {
        private String clinicName;
        private String symptoms;
        private List<String> symptomTags;
        private String diagnosis;
        private String treatment;
        private LocalDate medicationStartDate;
        private Integer medicationDays;
        private BigDecimal amount;
    }

    @Getter
    @NoArgsConstructor
    public static class ExpenseDetailRequest {
        private String category;
        private BigDecimal amount;
        private String memo;
        private UUID relatedMedicalRecordId;
    }
}
