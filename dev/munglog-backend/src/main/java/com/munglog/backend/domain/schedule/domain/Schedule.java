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

@Entity
@Table(name = "tb_schedule")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Schedule extends BaseTimeEntity {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Member user;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type", nullable = false)
    private ScheduleType scheduleType;

    @Builder.Default
    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    @Column(name = "title")
    private String title;

    @Column(name = "schedule_date")
    private LocalDateTime scheduleDate;

    @Column(name = "memo", columnDefinition = "TEXT")
    private String memo;

    @Column(name = "location")
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id")
    private InventoryItem linkedInventoryItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vaccination_type_id")
    private VaccinationType vaccinationType;

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

    public void toggleCompletion() {
        this.isCompleted = !Boolean.TRUE.equals(this.isCompleted);
    }
}
