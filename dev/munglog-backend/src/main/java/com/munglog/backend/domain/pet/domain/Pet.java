package com.munglog.backend.domain.pet.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.family.domain.FamilyGroup;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * 반려동물 엔티티.
 * 가족 그룹에 속한 반려동물의 기본 정보 및 성격·외모·AI 다이어리 설정을 저장한다.
 * isActive=false 상태로 소프트 삭제를 지원하며 삭제된 데이터는 DB에 남는다.
 * 주요 기능: 정보 수정, 소프트 삭제, 복원
 */
@Entity
@Table(name = "tb_pet")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Pet extends BaseTimeEntity {

    /** 반려동물 고유 식별자 (UUID 자동 생성) */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 이 반려동물이 속한 가족 그룹 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private FamilyGroup group;

    /** 반려동물을 처음 등록한 회원의 UUID */
    @Column(name = "registered_by", columnDefinition = "uuid")
    private UUID registeredBy;

    /** 반려동물 이름 */
    @Column(name = "name", nullable = false)
    private String name;

    /** 견종·묘종 등 품종 */
    @Column(name = "breed")
    private String breed;

    /** 생년월일 */
    @Column(name = "birth_date")
    private LocalDate birthDate;

    /** 입양일 */
    @Column(name = "adoption_date")
    private LocalDate adoptionDate;

    /** 성별 (기본값: UNKNOWN) */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "gender")
    private Gender gender = Gender.UNKNOWN;

    /** 몸무게 (kg) */
    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;

    /** 프로필 이미지 저장 경로 (레거시 필드; 첨부파일 테이블 우선 사용) */
    @Column(name = "profile_image_path")
    private String profileImagePath;

    /** 성격 특성 (자유 텍스트) */
    @Column(name = "personality", columnDefinition = "TEXT")
    private String personality;

    /** 외모 특징 (자유 텍스트) */
    @Column(name = "appearance", columnDefinition = "TEXT")
    private String appearance;

    /** 좋아하는 것 (AI 다이어리 생성 참고 정보) */
    @Column(name = "likes", columnDefinition = "TEXT")
    private String likes;

    /** 싫어하는 것 (AI 다이어리 생성 참고 정보) */
    @Column(name = "dislikes", columnDefinition = "TEXT")
    private String dislikes;

    /** AI 다이어리 문체 설정 (예: 귀여운, 격식체 등) */
    @Column(name = "diary_tone")
    private String diaryTone;

    /** 동물등록번호 (15자리 이내) */
    @Column(name = "registration_number", length = 20)
    private String registrationNumber;

    /** 기타 메모 */
    @Column(name = "memo", columnDefinition = "TEXT")
    private String memo;

    /** 중성화 여부 (기본값: false) */
    @Builder.Default
    @Column(name = "is_neutered", nullable = false)
    private Boolean isNeutered = false;

    /** 활성 상태 여부; false이면 소프트 삭제된 상태 (기본값: true) */
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /**
     * [목적] 반려동물의 기본 정보(이름, 품종, 날짜, 성별, 몸무게)를 수정한다.
     * [설명] updateAll()에서 내부적으로 호출되는 헬퍼 메서드로, 기본 필드만 처리한다.
     *
     * @param name         새 이름
     * @param breed        새 품종
     * @param birthDate    새 생년월일
     * @param adoptionDate 새 입양일
     * @param gender       새 성별
     * @param weightKg     새 몸무게
     */
    public void update(String name, String breed, LocalDate birthDate, LocalDate adoptionDate,
                       Gender gender, BigDecimal weightKg) {
        this.name = name;
        this.breed = breed;
        this.birthDate = birthDate;
        this.adoptionDate = adoptionDate;
        this.gender = gender;
        this.weightKg = weightKg;
    }

    /**
     * [목적] 반려동물의 전체 정보를 한 번에 수정한다.
     * [설명] 기본 정보(update())와 추가 정보(프로필 이미지, 성격, 외모, AI 설정 등) 모두를 갱신한다.
     *        profileImagePath는 null이 아닌 경우에만 덮어쓴다.
     *        registrationNumber는 공백이면 null로 저장한다.
     *
     * @param name               새 이름
     * @param breed              새 품종
     * @param birthDate          새 생년월일
     * @param adoptionDate       새 입양일
     * @param gender             새 성별
     * @param weightKg           새 몸무게
     * @param profileImagePath   새 프로필 이미지 경로 (null이면 기존 유지)
     * @param personality        새 성격 특성
     * @param appearance         새 외모 특징
     * @param likes              새 좋아하는 것
     * @param dislikes           새 싫어하는 것
     * @param diaryTone          새 AI 다이어리 문체
     * @param registrationNumber 새 동물등록번호 (공백이면 null 저장)
     * @param isNeutered         중성화 여부
     * @param memo               기타 메모
     */
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

    /**
     * [목적] 반려동물을 소프트 삭제(비활성화)한다.
     * [설명] isActive를 false로 설정하여 목록 조회에서 제외되도록 한다. DB 데이터는 삭제되지 않는다.
     */
    public void delete() {
        this.isActive = false;
    }

    /**
     * [목적] 비활성화된 반려동물을 다시 활성화한다.
     * [설명] isActive를 true로 되돌려 목록에 다시 표시되도록 한다.
     */
    public void restore() {
        this.isActive = true;
    }
}
