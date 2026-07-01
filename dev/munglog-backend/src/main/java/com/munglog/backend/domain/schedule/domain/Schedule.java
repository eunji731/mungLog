package com.munglog.backend.domain.schedule.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.inventory.domain.InventoryItem;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.pet.domain.Pet;
import com.munglog.backend.domain.vaccination.domain.VaccinationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 일정(Schedule) 엔티티.
 * 반려동물의 병원·미용·예방접종 등 돌봄 일정을 저장하는 엔티티 클래스.
 * 완료 시 CareRecord(케어기록)으로 전환할 수 있으며,
 * 연결된 용품의 재고를 완료 여부에 따라 자동 조정한다.
 * 주요 기능: 일정 정보 저장, 수정, 완료 토글
 */
@Entity
@Table(name = "tb_schedule")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Schedule extends BaseTimeEntity {

    /** 일정 고유 식별자 (UUID) */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 일정에 해당하는 반려동물 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    /** 일정을 등록한 사용자 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Member user;

    /** 일정 유형 (병원·미용·예방접종 등) */
    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type", nullable = false)
    private ScheduleType scheduleType;

    /** 완료 여부 (기본값: false) */
    @Builder.Default
    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    /** 일정 제목 */
    @Column(name = "title")
    private String title;

    /** 일정 날짜·시간 */
    @Column(name = "schedule_date")
    private LocalDateTime scheduleDate;

    /** 메모 */
    @Column(name = "memo", columnDefinition = "TEXT")
    private String memo;

    /** 장소 */
    @Column(name = "location")
    private String location;

    /** 연결된 용품 (급여 일정과 재고 연동에 사용) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id")
    private InventoryItem linkedInventoryItem;

    /** 연결된 예방접종 종류 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vaccination_type_id")
    private VaccinationType vaccinationType;

    /**
     * [목적] 일정의 수정 가능한 모든 필드를 갱신한다.
     *
     * @param pet                  반려동물
     * @param scheduleType         일정 유형
     * @param scheduleDate         일정 날짜·시간
     * @param title                제목
     * @param memo                 메모
     * @param location             장소
     * @param linkedInventoryItem  연결 용품 (없으면 null)
     * @param vaccinationType      예방접종 종류 (없으면 null)
     */
    public void update(Pet pet, ScheduleType scheduleType, LocalDateTime scheduleDate,
                       String title, String memo, String location, InventoryItem linkedInventoryItem,
                       VaccinationType vaccinationType) {
        this.pet = pet;
        this.scheduleType = scheduleType;
        this.scheduleDate = scheduleDate;
        this.title = title;
        this.memo = memo;
        this.location = location;
        this.linkedInventoryItem = linkedInventoryItem;
        this.vaccinationType = vaccinationType;
    }

    /**
     * [목적] 완료 여부(isCompleted)를 반전시킨다.
     * [설명] 완료 → 미완료, 미완료 → 완료로 전환한다.
     *        완료 상태 변경 시 연결 용품 재고 조정은 서비스 계층에서 처리한다.
     */
    public void toggleCompletion() {
        this.isCompleted = !Boolean.TRUE.equals(this.isCompleted);
    }
}
