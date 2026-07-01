package com.munglog.backend.domain.symptom.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 증상 마스터 엔티티.
 * 시스템 전체에서 공유하는 증상 이름 목록을 관리하는 클래스.
 * 활성/비활성 상태를 통해 소프트 삭제를 지원하며,
 * 진료 기록·일정·증상 스냅 등 여러 도메인에서 공통으로 참조한다.
 */
@Entity
@Table(name = "tb_symptom_master")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SymptomMaster {

    /** 기본 키 (자동 증가) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 증상명 (중복 불가) */
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    /** 활성 여부 (false이면 검색 결과에서 숨김) */
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /** 생성 일시 */
    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * [목적] 증상명을 변경한다.
     *
     * @param name 새 증상명
     */
    public void updateName(String name) {
        this.name = name;
    }

    /**
     * [목적] 증상을 비활성화(소프트 삭제)한다.
     * [설명] isActive를 false로 설정하여 검색 목록에서 제외되도록 한다.
     */
    public void deactivate() {
        this.isActive = false;
    }

    /**
     * [목적] 비활성화된 증상을 다시 활성화한다.
     */
    public void activate() {
        this.isActive = true;
    }
}
