package com.munglog.backend.domain.pet.dto;

import com.munglog.backend.domain.pet.domain.Gender;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class PetRequest {
    private String name;
    private String breed;
    private LocalDate birthDate;
    private LocalDate adoptionDate;
    private Gender gender;
    private BigDecimal weightKg;
    private String traits;
    private String appearance;
    private String likes;
    private String dislikes;
    private String diaryTone;
    private String registrationNumber;
    private Boolean isNeutered;
    private String memo;
}
