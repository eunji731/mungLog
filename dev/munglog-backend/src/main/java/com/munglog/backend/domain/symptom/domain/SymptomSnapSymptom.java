package com.munglog.backend.domain.symptom.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * 증상 스냅-증상 연결 엔티티.
 * 하나의 증상 스냅(SymptomSnap)에 연결된 증상 태그를 저장하는 중간 테이블 클래스.
 * 스냅 기록 시 관찰된 증상 목록을 별도로 관리한다.
 */
@Entity
@Table(name = "tb_symptom_snap_symptom")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SymptomSnapSymptom {

    /** 기본 키 (자동 증가) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 연결된 증상 스냅 UUID */
    @Column(name = "symptom_snap_id", nullable = false, columnDefinition = "uuid")
    private UUID symptomSnapId;

    /** 연결된 증상 마스터 ID */
    @Column(name = "symptom_id", nullable = false)
    private Long symptomId;
}
