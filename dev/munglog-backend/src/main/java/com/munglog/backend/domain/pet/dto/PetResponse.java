package com.munglog.backend.domain.pet.dto;

import com.munglog.backend.domain.pet.domain.Gender;
import com.munglog.backend.domain.pet.domain.Pet;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Builder
public record PetResponse(
        UUID id,
        String name,
        String breed,
        LocalDate birthDate,
        LocalDate adoptionDate,
        Gender gender,
        BigDecimal weightKg,
        String profileImageUrl,
        String traits,
        String appearance,
        String likes,
        String dislikes,
        String diaryTone,
        String registrationNumber
) {
    public static PetResponse from(Pet pet, String photoUrl) {
        return PetResponse.builder()
                .id(pet.getId())
                .name(pet.getName())
                .breed(pet.getBreed())
                .birthDate(pet.getBirthDate())
                .adoptionDate(pet.getAdoptionDate())
                .gender(pet.getGender())
                .weightKg(pet.getWeightKg())
                .profileImageUrl(photoUrl)
                .traits(pet.getPersonality())
                .appearance(pet.getAppearance())
                .likes(pet.getLikes())
                .dislikes(pet.getDislikes())
                .diaryTone(pet.getDiaryTone())
                .registrationNumber(pet.getRegistrationNumber())
                .build();
    }
}
