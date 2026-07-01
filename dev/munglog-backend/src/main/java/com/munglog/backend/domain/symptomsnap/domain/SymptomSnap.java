package com.munglog.backend.domain.symptomsnap.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.pet.domain.Pet;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * 증상 스냅 엔티티.
 * 반려동물에서 관찰된 증상을 날짜·시간과 함께 기록하는 클래스.
 * 진료 기록(resolvedRecordId) 또는 일정(linkedScheduleId)과 연동할 수 있으며,
 * 연동 상태에 따라 MONITORING ↔ RESOLVED 상태로 전환된다.
 */
@Entity
@Table(name = "tb_symptom_snap")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SymptomSnap extends BaseTimeEntity {

    /** 고유 식별자 (UUID 자동 생성) */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 증상이 관찰된 반려동물 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    /** 증상을 기록한 사용자 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Member user;

    /** 증상 관찰 날짜 */
    @Column(name = "snap_date", nullable = false)
    private LocalDate date;

    /** 증상 관찰 시각 */
    @Column(name = "snap_time", nullable = false)
    private LocalTime time;

    /** 증상에 대한 메모 */
    @Column(name = "memo", columnDefinition = "TEXT", nullable = false)
    private String memo;

    /** 처리 상태 (MONITORING: 관찰 중, RESOLVED: 진료 완료) */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false)
    private SymptomSnapStatus status = SymptomSnapStatus.MONITORING;

    /** 연동된 진료 기록 UUID (진료 완료 시 설정) */
    @Column(name = "resolved_record_id", columnDefinition = "uuid")
    private UUID resolvedRecordId;

    /** 연동된 일정 UUID */
    @Column(name = "linked_schedule_id", columnDefinition = "uuid")
    private UUID linkedScheduleId;

    /**
     * [목적] 증상 스냅의 날짜·시각·메모를 수정한다.
     *
     * @param date  새 관찰 날짜
     * @param time  새 관찰 시각
     * @param memo  새 메모
     */
    public void update(LocalDate date, LocalTime time, String memo) {
        this.date = date;
        this.time = time;
        this.memo = memo;
    }

    /**
     * [목적] 진료 기록과 연동하고 상태를 RESOLVED로 변경한다.
     *
     * @param resolvedRecordId 연동할 진료 기록 UUID
     */
    public void link(UUID resolvedRecordId) {
        this.resolvedRecordId = resolvedRecordId;
        this.status = SymptomSnapStatus.RESOLVED;
    }

    /**
     * [목적] 진료 기록 연동을 해제하고 상태를 MONITORING으로 되돌린다.
     */
    public void unlink() {
        this.resolvedRecordId = null;
        this.status = SymptomSnapStatus.MONITORING;
    }

    /**
     * [목적] 특정 일정과 연동한다.
     *
     * @param linkedScheduleId 연동할 일정 UUID
     */
    public void linkSchedule(UUID linkedScheduleId) {
        this.linkedScheduleId = linkedScheduleId;
    }

    /**
     * [목적] 일정 연동을 해제한다.
     */
    public void unlinkSchedule() {
        this.linkedScheduleId = null;
    }
}
