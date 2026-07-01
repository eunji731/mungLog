package com.munglog.backend.domain.pet.dto;

import com.munglog.backend.domain.pet.domain.Gender;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 반려동물 등록·수정 요청 DTO.
 * 클라이언트가 반려동물 정보를 전송할 때 사용하는 데이터 구조.
 * 프로필 이미지는 별도의 multipart 파트로 전송하며, 이 DTO에는 포함되지 않는다.
 */
@Getter
@NoArgsConstructor
public class PetRequest {
    /** 반려동물 이름 */
    private String name;
    /** 품종 */
    private String breed;
    /** 생년월일 */
    private LocalDate birthDate;
    /** 입양일 */
    private LocalDate adoptionDate;
    /** 성별 */
    private Gender gender;
    /** 몸무게 (kg) */
    private BigDecimal weightKg;
    /** 성격 특성 */
    private String traits;
    /** 외모 특징 */
    private String appearance;
    /** 좋아하는 것 */
    private String likes;
    /** 싫어하는 것 */
    private String dislikes;
    /** AI 다이어리 문체 설정 */
    private String diaryTone;
    /** 동물등록번호 */
    private String registrationNumber;
    /** 중성화 여부 */
    private Boolean isNeutered;
    /** 기타 메모 */
    private String memo;
}
