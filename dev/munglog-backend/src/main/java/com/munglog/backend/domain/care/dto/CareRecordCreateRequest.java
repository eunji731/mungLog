package com.munglog.backend.domain.care.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 케어 기록 등록/수정 요청 DTO.
 * 케어 기록의 기본 정보와 진료 상세(MedicalDetailRequest), 지출 상세(ExpenseDetailRequest)를
 * 함께 받는 요청 클래스. recordType에 따라 하위 DTO 중 하나만 채워진다.
 */
@Getter
@NoArgsConstructor
public class CareRecordCreateRequest {
    /** 케어 대상 반려동물 UUID */
    private UUID petId;
    /** 케어 유형 문자열 (CareRecordType enum 이름, 예: "HOSPITAL") */
    private String recordType;
    /** 케어 날짜 */
    private LocalDate recordDate;
    /** 케어 기록 제목 */
    private String title;
    /** 케어 기록 메모 */
    private String note;
    /** 이 기록을 생성한 스케줄 ID (스케줄에서 완료 처리 시 전달) */
    private UUID sourceScheduleId;
    /** 첨부파일 ID 목록 (기등록된 파일 연동 시 사용) */
    private List<UUID> fileIds;
    /** 예방접종 종류 ID (recordType=VACCINATION일 때 사용) */
    private Long vaccinationTypeId;
    /** 진료 상세 정보 (병원/투약/검진 등 의료 기록일 때 사용) */
    private MedicalDetailRequest medicalDetail;
    /** 지출 상세 정보 (recordType=EXPENSE일 때 사용) */
    private ExpenseDetailRequest expenseDetail;

    /**
     * 진료 상세 요청 내부 클래스.
     * 병원명, 증상, 진단, 치료, 투약 정보를 포함한다.
     */
    @Getter
    @NoArgsConstructor
    public static class MedicalDetailRequest {
        /** 병원명 */
        private String clinicName;
        /** 증상 설명 */
        private String symptoms;
        /** 증상 태그 목록 (증상 마스터와 연동) */
        private List<String> symptomTags;
        /** 진단명 */
        private String diagnosis;
        /** 치료 내용 */
        private String treatment;
        /** 투약 시작일 */
        private LocalDate medicationStartDate;
        /** 투약 기간 (일) */
        private Integer medicationDays;
        /** 진료비 */
        private BigDecimal amount;
    }

    /**
     * 지출 상세 요청 내부 클래스.
     * 지출 카테고리, 금액, 메모, 연동 병원 기록을 포함한다.
     */
    @Getter
    @NoArgsConstructor
    public static class ExpenseDetailRequest {
        /** 지출 카테고리 */
        private String category;
        /** 지출 금액 */
        private BigDecimal amount;
        /** 지출 메모 */
        private String memo;
        /** 연동할 병원 기록 ID (진료비 지출 시 해당 HOSPITAL 기록 UUID) */
        private UUID relatedMedicalRecordId;
    }
}
