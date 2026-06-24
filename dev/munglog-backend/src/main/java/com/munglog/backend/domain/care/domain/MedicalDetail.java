package com.munglog.backend.domain.care.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tb_medical_detail")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MedicalDetail {

    @Id
    @Column(name = "care_record_id", columnDefinition = "uuid")
    private UUID careRecordId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "care_record_id")
    private CareRecord careRecord;

    @Column(name = "clinic_name")
    private String clinicName;

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "diagnosis", columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "treatment", columnDefinition = "TEXT")
    private String treatment;

    @Column(name = "medication_start_date")
    private LocalDate medicationStartDate;

    @Column(name = "medication_days")
    private Integer medicationDays;

    @Builder.Default
    @Column(name = "is_medication_completed")
    private Boolean isMedicationCompleted = false;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount;

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
