package com.munglog.backend.domain.symptom.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * 일정-증상 연결 엔티티.
 * 하나의 일정(Schedule)에 연결된 증상 태그를 저장하는 중간 테이블 클래스.
 * 일정에 기록된 증상 정보를 별도로 관리한다.
 */
@Entity
@Table(name = "tb_schedule_symptom")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ScheduleSymptom {

    /** 기본 키 (자동 증가) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 연결된 일정 UUID */
    @Column(name = "schedule_id", nullable = false, columnDefinition = "uuid")
    private UUID scheduleId;

    /** 연결된 증상 마스터 ID */
    @Column(name = "symptom_id", nullable = false)
    private Long symptomId;
}
