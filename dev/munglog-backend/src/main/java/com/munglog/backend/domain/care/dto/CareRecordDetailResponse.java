package com.munglog.backend.domain.care.dto;

import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.domain.care.domain.CareRecord;
import com.munglog.backend.domain.care.domain.CareRecordType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Builder
public record CareRecordDetailResponse(
        UUID id,
        UUID petId,
        String petName,
        CareRecordType recordType,
        LocalDate recordDate,
        String title,
        String note,
        Long vaccinationTypeId,
        String vaccinationTypeName,
        Integer vaccinationIntervalDays,
        MedicalDetailDto medicalDetail,
        ExpenseDetailDto expenseDetail,
        List<FileResponse> attachments
) {
    @Builder
    public record MedicalDetailDto(
            String clinicName,
            String symptoms,
            List<String> symptomTags,
            String diagnosis,
            String treatment,
            LocalDate medicationStartDate,
            Integer medicationDays,
            Boolean isMedicationCompleted,
            BigDecimal amount
    ) {}

    @Builder
    public record ExpenseDetailDto(
            String category,
            BigDecimal amount,
            String memo,
            UUID relatedMedicalRecordId,
            RelatedMedicalRecordDto relatedMedicalRecord
    ) {}

    @Builder
    public record RelatedMedicalRecordDto(
            UUID id,
            String title,
            LocalDate recordDate,
            String clinicName
    ) {}

    public static CareRecordDetailResponse from(CareRecord record, List<String> symptomTags,
                                                 List<FileResponse> attachments) {
        return from(record, symptomTags, attachments, null);
    }

    public static CareRecordDetailResponse from(CareRecord record, List<String> symptomTags,
                                                 List<FileResponse> attachments, CareRecord relatedMedicalRecord) {
        MedicalDetailDto medDto = null;
        if (record.getMedicalDetail() != null) {
            var med = record.getMedicalDetail();
            medDto = MedicalDetailDto.builder()
                    .clinicName(med.getClinicName()).symptoms(med.getSymptoms())
                    .symptomTags(symptomTags).diagnosis(med.getDiagnosis())
                    .treatment(med.getTreatment()).medicationStartDate(med.getMedicationStartDate())
                    .medicationDays(med.getMedicationDays())
                    .isMedicationCompleted(med.getIsMedicationCompleted())
                    .amount(med.getAmount()).build();
        }

        ExpenseDetailDto expDto = null;
        if (record.getExpenseDetail() != null) {
            var exp = record.getExpenseDetail();
            RelatedMedicalRecordDto relatedDto = null;
            if (relatedMedicalRecord != null) {
                String clinicName = relatedMedicalRecord.getMedicalDetail() != null
                        ? relatedMedicalRecord.getMedicalDetail().getClinicName() : null;
                relatedDto = RelatedMedicalRecordDto.builder()
                        .id(relatedMedicalRecord.getId()).title(relatedMedicalRecord.getTitle())
                        .recordDate(relatedMedicalRecord.getRecordDate()).clinicName(clinicName)
                        .build();
            }
            expDto = ExpenseDetailDto.builder()
                    .category(exp.getCategory()).amount(exp.getAmount())
                    .memo(exp.getMemo()).relatedMedicalRecordId(exp.getRelatedMedicalRecordId())
                    .relatedMedicalRecord(relatedDto)
                    .build();
        }

        var vt = record.getVaccinationType();
        return CareRecordDetailResponse.builder()
                .id(record.getId()).petId(record.getPet().getId())
                .petName(record.getPet().getName()).recordType(record.getRecordType())
                .recordDate(record.getRecordDate()).title(record.getTitle()).note(record.getNote())
                .vaccinationTypeId(vt != null ? vt.getId() : null)
                .vaccinationTypeName(vt != null ? vt.getName() : null)
                .vaccinationIntervalDays(vt != null ? vt.getIntervalDays() : null)
                .medicalDetail(medDto).expenseDetail(expDto).attachments(attachments)
                .build();
    }
}
