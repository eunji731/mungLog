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

/**
 * 케어 기록 엔티티.
 * 반려동물의 병원 방문, 투약, 미용, 예방접종, 건강검진, 지출 등 케어 이력을 저장하는 JPA 엔티티.
 * 케어 유형(recordType)에 따라 MedicalDetail 또는 ExpenseDetail이 1:1로 연결된다.
 */
@Entity
@Table(name = "tb_care_record")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CareRecord extends BaseTimeEntity {

    /** 케어 기록 고유 ID (UUID 자동 생성) */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 케어 대상 반려동물 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    /** 케어 기록을 작성한 회원 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Member user;

    /** 케어 기록 유형 (HOSPITAL, MEDICINE, GROOMING, VACCINATION, CHECKUP, EXPENSE, ETC) */
    @Enumerated(EnumType.STRING)
    @Column(name = "record_type", nullable = false)
    private CareRecordType recordType;

    /** 케어 날짜 */
    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    /** 케어 기록 제목 */
    @Column(name = "title")
    private String title;

    /** 케어 기록 메모 (긴 텍스트) */
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    /** 이 기록을 생성한 원본 스케줄 ID (스케줄 완료 시 자동 생성된 경우) */
    @Column(name = "source_schedule_id", columnDefinition = "uuid")
    private UUID sourceScheduleId;

    /** 예방접종 종류 (recordType=VACCINATION일 때만 설정) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vaccination_type_id")
    private VaccinationType vaccinationType;

    /** 진료 상세 정보 (recordType=HOSPITAL 등 의료 기록일 때 생성) */
    @OneToOne(mappedBy = "careRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    private MedicalDetail medicalDetail;

    /** 지출 상세 정보 (recordType=EXPENSE일 때 생성) */
    @OneToOne(mappedBy = "careRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    private ExpenseDetail expenseDetail;

    /**
     * [목적] 케어 기록의 주요 필드를 한 번에 수정한다.
     *
     * @param pet              수정할 반려동물
     * @param recordType       수정할 케어 유형
     * @param recordDate       수정할 케어 날짜
     * @param title            수정할 제목
     * @param note             수정할 메모
     * @param vaccinationType  수정할 예방접종 종류 (없으면 null)
     */
    public void update(Pet pet, CareRecordType recordType, LocalDate recordDate, String title, String note,
                       VaccinationType vaccinationType) {
        this.pet = pet;
        this.recordType = recordType;
        this.recordDate = recordDate;
        this.title = title;
        this.note = note;
        this.vaccinationType = vaccinationType;
    }

    /**
     * [목적] 예방접종 종류만 별도로 수정한다.
     * [설명] AI 분석 후 접종 종류를 자동 매핑할 때 사용한다.
     *
     * @param vaccinationType 새로 연결할 예방접종 종류
     */
    public void updateVaccinationType(VaccinationType vaccinationType) {
        this.vaccinationType = vaccinationType;
    }
}
