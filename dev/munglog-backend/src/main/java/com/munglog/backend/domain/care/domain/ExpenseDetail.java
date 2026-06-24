package com.munglog.backend.domain.care.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "tb_expense_detail")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ExpenseDetail {

    @Id
    @Column(name = "care_record_id", columnDefinition = "uuid")
    private UUID careRecordId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "care_record_id")
    private CareRecord careRecord;

    @Column(name = "category")
    private String category;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "memo", columnDefinition = "TEXT")
    private String memo;

    @Column(name = "related_medical_record_id", columnDefinition = "uuid")
    private UUID relatedMedicalRecordId;

    public void update(String category, BigDecimal amount, String memo, UUID relatedMedicalRecordId) {
        this.category = category;
        this.amount = amount;
        this.memo = memo;
        this.relatedMedicalRecordId = relatedMedicalRecordId;
    }
}
