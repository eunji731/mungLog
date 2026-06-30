package com.munglog.backend.domain.care.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.pet.domain.Pet;
import com.munglog.backend.domain.vaccination.domain.VaccinationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tb_care_record")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CareRecord extends BaseTimeEntity {

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
    @Column(name = "record_type", nullable = false)
    private CareRecordType recordType;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(name = "title")
    private String title;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "source_schedule_id", columnDefinition = "uuid")
    private UUID sourceScheduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vaccination_type_id")
    private VaccinationType vaccinationType;

    @OneToOne(mappedBy = "careRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    private MedicalDetail medicalDetail;

    @OneToOne(mappedBy = "careRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    private ExpenseDetail expenseDetail;

    public void update(Pet pet, CareRecordType recordType, LocalDate recordDate, String title, String note,
                       VaccinationType vaccinationType) {
        this.pet = pet;
        this.recordType = recordType;
        this.recordDate = recordDate;
        this.title = title;
        this.note = note;
        this.vaccinationType = vaccinationType;
    }

    public void updateVaccinationType(VaccinationType vaccinationType) {
        this.vaccinationType = vaccinationType;
    }
}
