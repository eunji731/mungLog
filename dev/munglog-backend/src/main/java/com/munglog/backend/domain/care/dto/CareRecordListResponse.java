package com.munglog.backend.domain.care.dto;

import com.munglog.backend.domain.care.domain.CareRecord;
import com.munglog.backend.domain.care.domain.CareRecordType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * 케어 기록 목록 응답 DTO.
 * 목록 화면에서 필요한 요약 정보를 반환하는 레코드 클래스.
 * 진료 기록이면 진료비와 투약 상태를, 지출 기록이면 금액과 연동 병원 기록 ID를 포함한다.
 */
@Builder
public record CareRecordListResponse(
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
        /** 첨부파일 수 */
        int attachmentCount,
        /** 금액 (진료비 또는 지출 금액) */
        BigDecimal amount,
        /** 연동된 병원 기록 ID (지출 기록일 경우) */
        UUID relatedMedicalRecordId,
        /** 투약 상태 ("IN_PROGRESS" | "COMPLETED", 투약 정보가 없으면 null) */
        String medicationStatus,
        /** 예방접종 종류 ID */
        Long vaccinationTypeId,
        /** 예방접종 종류 이름 */
        String vaccinationTypeName,
        /** 예방접종 권장 주기 (일) */
        Integer vaccinationIntervalDays
) {
    /**
     * [목적] CareRecord 엔티티와 첨부파일 수를 받아 목록 응답 DTO를 생성한다.
     * [설명] 진료 상세가 있으면 진료비와 투약 상태를,
     *        지출 상세가 있으면 금액과 연동 병원 기록 ID를 채운다.
     *        투약 정보가 있을 때만 medicationStatus를 설정한다.
     *
     * @param record          케어 기록 엔티티
     * @param attachmentCount 첨부파일 수
     * @return 케어 기록 목록 응답 DTO
     */
    public static CareRecordListResponse from(CareRecord record, int attachmentCount) {
        BigDecimal amount = null;
        UUID relatedMedicalRecordId = null;
        String medicationStatus = null;

        if (record.getMedicalDetail() != null) {
            amount = record.getMedicalDetail().getAmount();
            if (record.getMedicalDetail().getMedicationStartDate() != null ||
                (record.getMedicalDetail().getMedicationDays() != null && record.getMedicalDetail().getMedicationDays() > 0)) {
                medicationStatus = Boolean.TRUE.equals(record.getMedicalDetail().getIsMedicationCompleted())
                        ? "COMPLETED" : "IN_PROGRESS";
            }
        }
        if (record.getExpenseDetail() != null) {
            amount = record.getExpenseDetail().getAmount();
            relatedMedicalRecordId = record.getExpenseDetail().getRelatedMedicalRecordId();
        }

        var vt = record.getVaccinationType();
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
                .vaccinationTypeId(vt != null ? vt.getId() : null)
                .vaccinationTypeName(vt != null ? vt.getName() : null)
                .vaccinationIntervalDays(vt != null ? vt.getIntervalDays() : null)
                .build();
    }
}
