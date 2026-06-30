package com.munglog.backend.domain.vaccination.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.family.domain.FamilyGroup;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "tb_vaccination_type")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class VaccinationType extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private FamilyGroup group;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "interval_days")
    private Integer intervalDays;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "merged_into_id")
    private Long mergedIntoId;

    public void update(String name, Integer intervalDays) {
        this.name = name;
        this.intervalDays = intervalDays;
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void mergeTo(Long targetId) {
        this.mergedIntoId = targetId;
        this.isActive = false;
    }
}
