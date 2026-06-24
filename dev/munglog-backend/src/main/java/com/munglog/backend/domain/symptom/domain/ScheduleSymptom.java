package com.munglog.backend.domain.symptom.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "tb_schedule_symptom")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ScheduleSymptom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "schedule_id", nullable = false, columnDefinition = "uuid")
    private UUID scheduleId;

    @Column(name = "symptom_id", nullable = false)
    private Long symptomId;
}
