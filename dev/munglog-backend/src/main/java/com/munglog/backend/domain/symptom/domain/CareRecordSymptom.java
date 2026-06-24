package com.munglog.backend.domain.symptom.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "tb_care_record_symptom")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CareRecordSymptom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "care_record_id", nullable = false, columnDefinition = "uuid")
    private UUID careRecordId;

    @Column(name = "symptom_id", nullable = false)
    private Long symptomId;

    @Column(name = "pet_id", columnDefinition = "uuid")
    private UUID petId;

    @Column(name = "severity_code")
    private String severityCode;
}
