package com.munglog.backend.domain.symptom.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "tb_symptom_snap_symptom")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SymptomSnapSymptom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "symptom_snap_id", nullable = false, columnDefinition = "uuid")
    private UUID symptomSnapId;

    @Column(name = "symptom_id", nullable = false)
    private Long symptomId;
}
