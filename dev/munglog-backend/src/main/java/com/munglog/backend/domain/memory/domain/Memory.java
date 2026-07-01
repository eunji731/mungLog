package com.munglog.backend.domain.memory.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.family.domain.FamilyGroup;
import com.munglog.backend.domain.member.domain.Member;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 반려동물 일지(Memory) 엔티티.
 * 특정 날짜에 반려동물과 있었던 하루 기록을 저장하는 JPA 엔티티 클래스.
 * 주요 기능: 일지 기본 정보 관리, 사진/순간/반려동물 연관관계 관리, AI 분석 결과 저장
 */
@Entity
@Table(name = "tb_memory")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Memory extends BaseTimeEntity {

    /** 일지의 고유 식별자 (UUID 자동 생성) */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 일지를 생성한 회원 (지연 로딩) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Member user;

    /** 일지가 속한 가족 그룹 (지연 로딩, 그룹 공유 시 사용) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private FamilyGroup group;

    /** 일지 날짜 */
    @Column(name = "memory_date", nullable = false)
    private LocalDate memoryDate;

    /** 사용자가 직접 작성한 일지 요약 */
    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    /** 활동 유형 (예: 산책, 병원, 훈련 등) */
    @Column(name = "activity_type")
    private String activityType;

    /** 날씨 정보 (예: 맑음, 흐림 등) */
    @Column(name = "weather")
    private String weather;

    /** 반려동물의 에너지 레벨 (예: HIGH, MEDIUM, LOW) */
    @Column(name = "energy_level")
    private String energyLevel;

    /** 활동 장소 */
    @Column(name = "location")
    private String location;

    /** 사용자가 직접 작성한 메모 */
    @Column(name = "user_memo", columnDefinition = "TEXT")
    private String userMemo;

    /** AI가 생성한 일지 제목 */
    @Column(name = "ai_title")
    private String aiTitle;

    /** AI가 생성한 일기 내용 전문 */
    @Column(name = "ai_diary", columnDefinition = "TEXT")
    private String aiDiary;

    /** AI 일기 재생성 횟수 (제한 초과 여부 확인에 사용) */
    @Builder.Default
    @Column(name = "ai_generate_count")
    private Integer aiGenerateCount = 0;

    /** AI 생성 처리 상태 (예: PENDING, COMPLETED, FAILED) */
    @Column(name = "ai_status")
    private String aiStatus;

    /** 해당 일지에 포함된 사진 목록 (CASCADE 삭제) */
    @OneToMany(mappedBy = "memory", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Photo> photos = new ArrayList<>();

    /** 해당 일지의 순간(활동 장면) 목록 (CASCADE 삭제) */
    @OneToMany(mappedBy = "memory", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MemoryMoment> moments = new ArrayList<>();

    /** 이 일지에 등장하는 반려동물 연결 목록 (CASCADE 삭제) */
    @OneToMany(mappedBy = "memory", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MemoryDog> memoryDogs = new ArrayList<>();

    /** 일지 목록에 표시할 대표 사진 */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "representative_photo_id")
    private Photo representativePhoto;

    /**
     * [목적] 일지의 대표 사진을 지정
     * [설명] AI 분석 후 가장 대표적인 사진을 선택하여 일지 목록 썸네일로 사용한다.
     *
     * @param photo 대표 사진으로 지정할 Photo 엔티티
     */
    public void setRepresentativePhoto(Photo photo) {
        this.representativePhoto = photo;
    }
}
