package com.munglog.backend.domain.care.dto;

import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.domain.care.domain.CareRecord;
import com.munglog.backend.domain.care.domain.CareRecordType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 케어 기록 상세 응답 DTO.
 * 케어 기록의 모든 정보(기본 정보, 진료 상세, 지출 상세, 증상 태그, 첨부파일)를 반환하는 레코드 클래스.
 */
@Builder
public record CareRecordDetailResponse(
        /** 케어 기록 UUID */
        UUID id,
        /** 반려동물 UUID */
        UUID petId,
        /** 반려동물 이름 */
        String petName,
        /** 케어 유형 */
        CareRecordType recordType,
        /** 케어 날짜 */
        LocalDate recordDate,
        /** 케어 제목 */
        String title,
        /** 케어 메모 */
        String note,
        /** 예방접종 종류 ID */
        Long vaccinationTypeId,
        /** 예방접종 종류 이름 */
        String vaccinationTypeName,
        /** 예방접종 권장 주기 (일) */
        Integer vaccinationIntervalDays,
        /** 진료 상세 정보 (없으면 null) */
        MedicalDetailDto medicalDetail,
        /** 지출 상세 정보 (없으면 null) */
        ExpenseDetailDto expenseDetail,
        /** 첨부파일 목록 */
        List<FileResponse> attachments
) {
    /**
     * 진료 상세 응답 내부 클래스.
     */
    @Builder
    public record MedicalDetailDto(
            /** 병원명 */
            String clinicName,
            /** 증상 설명 */
            String symptoms,
            /** 증상 태그 목록 */
            List<String> symptomTags,
            /** 진단명 */
            String diagnosis,
            /** 치료 내용 */
            String treatment,
            /** 투약 시작일 */
            LocalDate medicationStartDate,
            /** 투약 기간 (일) */
            Integer medicationDays,
            /** 투약 완료 여부 */
            Boolean isMedicationCompleted,
            /** 진료비 */
            BigDecimal amount
    ) {}

    /**
     * 지출 상세 응답 내부 클래스.
     */
    @Builder
    public record ExpenseDetailDto(
            /** 지출 카테고리 */
            String category,
            /** 지출 금액 */
            BigDecimal amount,
            /** 지출 메모 */
            String memo,
            /** 연동된 병원 기록 ID */
            UUID relatedMedicalRecordId,
            /** 연동된 병원 기록 요약 정보 */
            RelatedMedicalRecordDto relatedMedicalRecord
    ) {}

    /**
     * 연동된 병원 기록 요약 응답 내부 클래스.
     */
    @Builder
    public record RelatedMedicalRecordDto(
            /** 병원 기록 UUID */
            UUID id,
            /** 병원 기록 제목 */
            String title,
            /** 진료 날짜 */
            LocalDate recordDate,
            /** 병원명 */
            String clinicName
    ) {}

    /**
     * [목적] 연동 병원 기록 없이 CareRecord에서 응답 DTO를 생성한다.
     *
     * @param record      케어 기록 엔티티
     * @param symptomTags 증상 태그 목록
     * @param attachments 첨부파일 목록
     * @return 케어 기록 상세 응답 DTO
     */
    public static CareRecordDetailResponse from(CareRecord record, List<String> symptomTags,
                                                 List<FileResponse> attachments) {
        return from(record, symptomTags, attachments, null);
    }

    /**
     * [목적] 연동 병원 기록을 포함하여 CareRecord에서 응답 DTO를 생성한다.
     * [설명] 진료 상세와 지출 상세가 있을 경우 각각 내부 DTO로 변환한다.
     *        relatedMedicalRecord는 지출 기록에 연동된 병원 기록 요약이다.
     *
     * @param record               케어 기록 엔티티
     * @param symptomTags          증상 태그 목록
     * @param attachments          첨부파일 목록
     * @param relatedMedicalRecord 연동된 병원 기록 엔티티 (없으면 null)
     * @return 케어 기록 상세 응답 DTO
     */
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
