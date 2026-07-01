package com.munglog.backend.domain.memory.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 일지 순간(Moment) 엔티티.
 * 하나의 일지(Memory) 안에서 구분되는 활동 장면(순간)을 나타내는 JPA 엔티티 클래스.
 * 주요 기능: 활동 카테고리별 사진 묶음 관리, AI 분석 결과(제목·내용) 저장, 위치 정보 관리
 */
@Entity
@Table(name = "tb_memory_moment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MemoryMoment extends BaseTimeEntity {

    /** 순간의 고유 식별자 (UUID 자동 생성) */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 이 순간이 속한 일지 (지연 로딩) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memory_id", nullable = false)
    private Memory memory;

    /** 일지 내에서 이 순간의 표시 순서 */
    @Column(name = "sort_order")
    private Integer sortOrder;

    /** 활동 카테고리 (예: 산책, 식사, 훈련, 병원 등) */
    @Column(name = "category")
    private String category;

    /** AI가 생성한 순간 제목 */
    @Column(name = "ai_title")
    private String aiTitle;

    /** AI가 생성한 순간 상세 내용 (TEXT 타입) */
    @Column(name = "ai_content", columnDefinition = "TEXT")
    private String aiContent;

    /** 활동 장소 이름 (예: 한강공원, 동물병원 등) */
    @Column(name = "location_name")
    private String locationName;

    /** 이 순간의 에너지 레벨 (예: HIGH, MEDIUM, LOW) */
    @Column(name = "energy_level")
    private String energyLevel;

    /** 쉼표로 구분된 태그 목록 문자열 (예: "산책,공원,맑음") */
    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;

    /** 이 순간의 대표 사진 파일 경로 */
    @Column(name = "representative_photo_path")
    private String representativePhotoPath;

    /** 이 순간에 속한 사진 목록 (CASCADE 저장) */
    @OneToMany(mappedBy = "moment", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Photo> photos = new ArrayList<>();
}
