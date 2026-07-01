package com.munglog.backend.domain.symptom.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * 진료 기록-증상 연결 엔티티.
 * 하나의 진료 기록(CareRecord)에 연결된 증상 태그를 저장하는 중간 테이블 클래스.
 * 심각도 코드(severityCode)를 통해 해당 진료 시 증상의 정도를 표현한다.
 */
@Entity
@Table(name = "tb_care_record_symptom")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CareRecordSymptom {

    /** 기본 키 (자동 증가) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 연결된 진료 기록 UUID */
    @Column(name = "care_record_id", nullable = false, columnDefinition = "uuid")
    private UUID careRecordId;

    /** 연결된 증상 마스터 ID */
    @Column(name = "symptom_id", nullable = false)
    private Long symptomId;

    /** 해당 증상이 발생한 반려동물 UUID */
    @Column(name = "pet_id", columnDefinition = "uuid")
    private UUID petId;

    /** 증상 심각도 코드 (코드 테이블 참조) */
    @Column(name = "severity_code")
    private String severityCode;
}
