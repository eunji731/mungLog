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

@Entity
@Table(name = "tb_symptom_snap")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SymptomSnap extends BaseTimeEntity {

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

    @Column(name = "snap_date", nullable = false)
    private LocalDate date;

    @Column(name = "snap_time", nullable = false)
    private LocalTime time;

    @Column(name = "memo", columnDefinition = "TEXT", nullable = false)
    private String memo;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false)
    private SymptomSnapStatus status = SymptomSnapStatus.MONITORING;

    @Column(name = "resolved_record_id", columnDefinition = "uuid")
    private UUID resolvedRecordId;

    public void update(LocalDate date, LocalTime time, String memo) {
        this.date = date;
        this.time = time;
        this.memo = memo;
    }

    public void link(UUID resolvedRecordId) {
        this.resolvedRecordId = resolvedRecordId;
        this.status = SymptomSnapStatus.RESOLVED;
    }

    public void unlink() {
        this.resolvedRecordId = null;
        this.status = SymptomSnapStatus.MONITORING;
    }
}
