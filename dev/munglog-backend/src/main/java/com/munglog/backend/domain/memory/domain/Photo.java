package com.munglog.backend.domain.memory.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tb_photo")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Photo extends BaseTimeEntity {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memory_id", nullable = false)
    private Memory memory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moment_id")
    private MemoryMoment moment;

    @Column(name = "path_origin")
    private String pathOrigin;

    @Column(name = "path_thumb_300")
    private String pathThumb300;

    @Column(name = "path_thumb_100")
    private String pathThumb100;

    @Column(name = "taken_at")
    private LocalDateTime takenAt;

    @Column(name = "gps_lat")
    private Double gpsLat;

    @Column(name = "gps_lng")
    private Double gpsLng;

    @Column(name = "gps_source")
    private String gpsSource;

    @Column(name = "ai_caption", columnDefinition = "TEXT")
    private String aiCaption;

    @Column(name = "ai_emotion")
    private String aiEmotion;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "ai_comment", columnDefinition = "TEXT")
    private String aiComment;

    @Column(name = "vibe_score")
    private Integer vibeScore;

    @Builder.Default
    @Column(name = "is_best")
    private Boolean isBest = false;

    @OneToMany(mappedBy = "photo", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PhotoThemeTag> themeTags = new ArrayList<>();

    public void assignMoment(MemoryMoment moment) {
        this.moment = moment;
    }

    public void updateAiData(String comment, Integer vibeScore, Boolean isBest) {
        this.aiComment = comment;
        this.vibeScore = vibeScore;
        this.isBest = isBest;
    }
}
