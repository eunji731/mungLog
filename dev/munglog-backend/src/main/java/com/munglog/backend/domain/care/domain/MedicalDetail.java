package com.munglog.backend.domain.care.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * 진료 상세 엔티티.
 * CareRecord(recordType=HOSPITAL 등 의료 유형)에 1:1로 연결되며,
 * 병원명, 증상, 진단, 치료, 투약 정보, 진료비를 저장한다.
 */
@Entity
@Table(name = "tb_medical_detail")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MedicalDetail {

    /** CareRecord와 공유하는 PK (care_record_id) */
    @Id
    @Column(name = "care_record_id", columnDefinition = "uuid")
    private UUID careRecordId;

    /** 연결된 케어 기록 (PK 공유 1:1 관계) */
    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "care_record_id")
    private CareRecord careRecord;

    /** 방문한 병원명 */
    @Column(name = "clinic_name")
    private String clinicName;

    /** 증상 설명 텍스트 */
    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    /** 진단 내용 */
    @Column(name = "diagnosis", columnDefinition = "TEXT")
    private String diagnosis;

    /** 치료 내용 */
    @Column(name = "treatment", columnDefinition = "TEXT")
    private String treatment;

    /** 투약 시작일 */
    @Column(name = "medication_start_date")
    private LocalDate medicationStartDate;

    /** 투약 기간 (일) */
    @Column(name = "medication_days")
    private Integer medicationDays;

    /** 투약 완료 여부 (기본값: false) */
    @Builder.Default
    @Column(name = "is_medication_completed")
    private Boolean isMedicationCompleted = false;

    /** 진료비 */
    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount;

    /**
     * [목적] 진료 상세 정보를 수정한다.
     *
     * @param clinicName          수정할 병원명
     * @param symptoms            수정할 증상
     * @param diagnosis           수정할 진단
     * @param treatment           수정할 치료 내용
     * @param medicationStartDate 수정할 투약 시작일
     * @param medicationDays      수정할 투약 기간 (일)
     * @param amount              수정할 진료비
     */
    public void update(String clinicName, String symptoms, String diagnosis, String treatment,
                       LocalDate medicationStartDate, Integer medicationDays, BigDecimal amount) {
        this.clinicName = clinicName;
        this.symptoms = symptoms;
        this.diagnosis = diagnosis;
        this.treatment = treatment;
        this.medicationStartDate = medicationStartDate;
        this.medicationDays = medicationDays;
        this.amount = amount;
    }
}
