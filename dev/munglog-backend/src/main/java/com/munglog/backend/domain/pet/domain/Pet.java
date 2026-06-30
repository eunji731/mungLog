package com.munglog.backend.domain.pet.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.family.domain.FamilyGroup;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tb_pet")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Pet extends BaseTimeEntity {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private FamilyGroup group;

    @Column(name = "registered_by", columnDefinition = "uuid")
    private UUID registeredBy;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "breed")
    private String breed;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "adoption_date")
    private LocalDate adoptionDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "gender")
    private Gender gender = Gender.UNKNOWN;

    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "profile_image_path")
    private String profileImagePath;

    @Column(name = "personality", columnDefinition = "TEXT")
    private String personality;

    @Column(name = "appearance", columnDefinition = "TEXT")
    private String appearance;

    @Column(name = "likes", columnDefinition = "TEXT")
    private String likes;

    @Column(name = "dislikes", columnDefinition = "TEXT")
    private String dislikes;

    @Column(name = "diary_tone")
    private String diaryTone;

    @Column(name = "registration_number", length = 20)
    private String registrationNumber;

    @Column(name = "memo", columnDefinition = "TEXT")
    private String memo;

    @Builder.Default
    @Column(name = "is_neutered", nullable = false)
    private Boolean isNeutered = false;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public void update(String name, String breed, LocalDate birthDate, LocalDate adoptionDate,
                       Gender gender, BigDecimal weightKg) {
        this.name = name;
        this.breed = breed;
        this.birthDate = birthDate;
        this.adoptionDate = adoptionDate;
        this.gender = gender;
        this.weightKg = weightKg;
    }

    public void updateAll(String name, String breed, LocalDate birthDate, LocalDate adoptionDate,
                          Gender gender, BigDecimal weightKg, String profileImagePath,
                          String personality, String appearance, String likes, String dislikes,
                          String diaryTone, String registrationNumber, Boolean isNeutered, String memo) {
        update(name, breed, birthDate, adoptionDate, gender, weightKg);
        if (profileImagePath != null) this.profileImagePath = profileImagePath;
        this.personality = personality;
        this.appearance = appearance;
        this.likes = likes;
        this.dislikes = dislikes;
        this.diaryTone = diaryTone;
        this.registrationNumber = (registrationNumber != null && !registrationNumber.isBlank())
                ? registrationNumber.trim() : null;
        this.isNeutered = isNeutered != null ? isNeutered : false;
        this.memo = memo;
    }

    public void delete() {
        this.isActive = false;
    }

    public void restore() {
        this.isActive = true;
    }
}
