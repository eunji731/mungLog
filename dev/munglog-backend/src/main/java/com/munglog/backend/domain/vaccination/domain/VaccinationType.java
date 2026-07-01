package com.munglog.backend.domain.vaccination.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.family.domain.FamilyGroup;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * 예방접종 종류 엔티티.
 * 시스템 전체에서 사용하는 접종 종류(전역) 또는 특정 그룹 전용 접종 종류를 관리하는 클래스.
 * group이 null이면 전역(글로벌) 접종 종류이며, 관리자만 수정할 수 있다.
 * group이 설정되면 해당 가족 그룹 전용 접종 종류이다.
 */
@Entity
@Table(name = "tb_vaccination_type")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class VaccinationType extends BaseTimeEntity {

    /** 기본 키 (자동 증가) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 소유 그룹 (null이면 전역 접종 종류) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private FamilyGroup group;

    /** 접종 종류명 */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /** 접종 권장 주기 (일 단위, null이면 주기 없음) */
    @Column(name = "interval_days")
    private Integer intervalDays;

    /** 활성 여부 (false이면 목록에서 숨김) */
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /** 병합된 접종 종류 ID (병합 처리 후 설정) */
    @Column(name = "merged_into_id")
    private Long mergedIntoId;

    /**
     * [목적] 접종 종류명과 주기를 수정한다.
     *
     * @param name         새 접종 종류명
     * @param intervalDays 새 접종 권장 주기 (일 단위)
     */
    public void update(String name, Integer intervalDays) {
        this.name = name;
        this.intervalDays = intervalDays;
    }

    /**
     * [목적] 접종 종류를 비활성화(소프트 삭제)한다.
     */
    public void deactivate() {
        this.isActive = false;
    }

    /**
     * [목적] 이 접종 종류를 다른 접종 종류로 병합 처리한다.
     * [설명] 병합 대상 ID를 저장하고 비활성화하여 더 이상 사용되지 않도록 처리한다.
     *
     * @param targetId 병합 대상(유지될) 접종 종류 ID
     */
    public void mergeTo(Long targetId) {
        this.mergedIntoId = targetId;
        this.isActive = false;
    }
}
