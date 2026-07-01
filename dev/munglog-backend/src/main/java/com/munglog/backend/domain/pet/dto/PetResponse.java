package com.munglog.backend.domain.pet.dto;

import com.munglog.backend.domain.pet.domain.Gender;
import com.munglog.backend.domain.pet.domain.Pet;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * 반려동물 응답 DTO.
 * 클라이언트에 반환되는 반려동물 데이터 구조.
 * profileImageUrl은 첨부파일 테이블 또는 레거시 경로에서 해석된 URL이다.
 *
 * @param id                반려동물 UUID
 * @param name              이름
 * @param breed             품종
 * @param birthDate         생년월일
 * @param adoptionDate      입양일
 * @param gender            성별
 * @param weightKg          몸무게 (kg)
 * @param profileImageUrl   프로필 이미지 접근 URL (없으면 null)
 * @param traits            성격 특성
 * @param appearance        외모 특징
 * @param likes             좋아하는 것
 * @param dislikes          싫어하는 것
 * @param diaryTone         AI 다이어리 문체 설정
 * @param registrationNumber 동물등록번호
 * @param isNeutered        중성화 여부
 * @param memo              기타 메모
 */
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
        String registrationNumber,
        Boolean isNeutered,
        String memo
) {
    /**
     * [목적] Pet 엔티티와 프로필 이미지 URL을 조합하여 응답 DTO를 생성한다.
     * [설명] Pet의 personality 필드를 traits로 매핑하는 등 엔티티 필드명과 DTO 필드명 간의 차이를 처리한다.
     *
     * @param pet      반려동물 엔티티
     * @param photoUrl 프로필 이미지 URL (없으면 null)
     * @return 반려동물 응답 DTO
     */
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
                .isNeutered(pet.getIsNeutered())
                .memo(pet.getMemo())
                .build();
    }
}
