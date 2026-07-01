package com.munglog.backend.domain.memory.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 사진 엔티티.
 * 반려동물 일지(Memory)에 첨부된 사진 정보를 저장하는 JPA 엔티티 클래스.
 * 주요 기능: 원본/썸네일 파일 경로 관리, GPS 좌표 저장, AI 분석 결과(캡션·감정·바이브 점수) 저장
 */
@Entity
@Table(name = "tb_photo")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Photo extends BaseTimeEntity {

    /** 사진의 고유 식별자 (UUID 자동 생성) */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 이 사진이 속한 일지 (지연 로딩) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memory_id", nullable = false)
    private Memory memory;

    /** 이 사진이 속한 순간 (선택적, 지연 로딩) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moment_id")
    private MemoryMoment moment;

    /** 원본 사진 파일 저장 경로 */
    @Column(name = "path_origin")
    private String pathOrigin;

    /** 300px 썸네일 파일 저장 경로 */
    @Column(name = "path_thumb_300")
    private String pathThumb300;

    /** 100px 썸네일 파일 저장 경로 */
    @Column(name = "path_thumb_100")
    private String pathThumb100;

    /** 사진 촬영 시각 (EXIF 또는 업로드 시각) */
    @Column(name = "taken_at")
    private LocalDateTime takenAt;

    /** GPS 위도 (WGS84 기준) */
    @Column(name = "gps_lat")
    private Double gpsLat;

    /** GPS 경도 (WGS84 기준) */
    @Column(name = "gps_lng")
    private Double gpsLng;

    /** GPS 출처 (예: EXIF, MANUAL 등) */
    @Column(name = "gps_source")
    private String gpsSource;

    /** AI가 생성한 사진 캡션 설명 */
    @Column(name = "ai_caption", columnDefinition = "TEXT")
    private String aiCaption;

    /** AI가 분석한 사진 속 감정 (예: 행복, 피곤 등) */
    @Column(name = "ai_emotion")
    private String aiEmotion;

    /** 일지/순간 내에서 사진 표시 순서 */
    @Column(name = "sort_order")
    private Integer sortOrder;

    /** AI가 생성한 사진 한 줄 코멘트 */
    @Column(name = "ai_comment", columnDefinition = "TEXT")
    private String aiComment;

    /** AI가 분석한 사진의 감성 점수 (높을수록 대표 사진으로 선정됨) */
    @Column(name = "vibe_score")
    private Integer vibeScore;

    /** 일지의 베스트 사진 여부 (대표 사진 후보) */
    @Builder.Default
    @Column(name = "is_best")
    private Boolean isBest = false;

    /** 이 사진에 붙은 테마 태그 목록 (CASCADE 삭제) */
    @OneToMany(mappedBy = "photo", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PhotoThemeTag> themeTags = new ArrayList<>();

    /**
     * [목적] 이 사진을 특정 순간(Moment)에 연결
     * [설명] AI 분석 후 사진을 적절한 활동 순간에 분류할 때 사용된다.
     *
     * @param moment 연결할 MemoryMoment 엔티티
     */
    public void assignMoment(MemoryMoment moment) {
        this.moment = moment;
    }

    /**
     * [목적] 사진의 썸네일 파일 경로를 업데이트
     * [설명] 업로드 후 비동기로 썸네일을 생성하거나 마이그레이션 시 사용한다.
     *
     * @param thumb100 100px 썸네일 파일 경로
     * @param thumb300 300px 썸네일 파일 경로
     */
    public void updateThumbs(String thumb100, String thumb300) {
        this.pathThumb100 = thumb100;
        this.pathThumb300 = thumb300;
    }

    /**
     * [목적] AI 분석 결과를 사진에 저장
     * [설명] AI가 분석한 코멘트, 바이브 점수, 베스트 여부를 업데이트한다.
     *        vibeScore가 높은 사진이 일지의 대표 사진으로 선정된다.
     *
     * @param comment   AI가 생성한 사진 코멘트
     * @param vibeScore AI가 분석한 감성 점수
     * @param isBest    베스트 사진 선정 여부
     */
    public void updateAiData(String comment, Integer vibeScore, Boolean isBest) {
        this.aiComment = comment;
        this.vibeScore = vibeScore;
        this.isBest = isBest;
    }
}
