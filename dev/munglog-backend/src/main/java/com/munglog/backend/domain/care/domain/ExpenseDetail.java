package com.munglog.backend.domain.care.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * 지출 상세 엔티티.
 * CareRecord(recordType=EXPENSE)에 1:1로 연결되며, 지출 카테고리·금액·메모를 저장한다.
 * 병원 기록과 연동하여 진료비를 추적할 수 있다.
 */
@Entity
@Table(name = "tb_expense_detail")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ExpenseDetail {

    /** CareRecord와 공유하는 PK (care_record_id) */
    @Id
    @Column(name = "care_record_id", columnDefinition = "uuid")
    private UUID careRecordId;

    /** 연결된 케어 기록 (PK 공유 1:1 관계) */
    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "care_record_id")
    private CareRecord careRecord;

    /** 지출 카테고리 (예: "진료비", "용품") */
    @Column(name = "category")
    private String category;

    /** 지출 금액 */
    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount;

    /** 지출 메모 */
    @Column(name = "memo", columnDefinition = "TEXT")
    private String memo;

    /** 연동된 병원 기록 ID (진료비 지출 시 해당 HOSPITAL 기록과 연결) */
    @Column(name = "related_medical_record_id", columnDefinition = "uuid")
    private UUID relatedMedicalRecordId;

    /**
     * [목적] 지출 상세 정보를 수정한다.
     *
     * @param category              수정할 지출 카테고리
     * @param amount                수정할 금액
     * @param memo                  수정할 메모
     * @param relatedMedicalRecordId 연동할 병원 기록 ID (없으면 null)
     */
    public void update(String category, BigDecimal amount, String memo, UUID relatedMedicalRecordId) {
        this.category = category;
        this.amount = amount;
        this.memo = memo;
        this.relatedMedicalRecordId = relatedMedicalRecordId;
    }
}
