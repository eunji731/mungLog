package com.munglog.backend.domain.memory.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.member.domain.Member;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tb_memory")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Memory extends BaseTimeEntity {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Member user;

    @Column(name = "memory_date", nullable = false)
    private LocalDate memoryDate;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "activity_type")
    private String activityType;

    @Column(name = "weather")
    private String weather;

    @Column(name = "energy_level")
    private String energyLevel;

    @Column(name = "location")
    private String location;

    @Column(name = "user_memo", columnDefinition = "TEXT")
    private String userMemo;

    @Column(name = "ai_title")
    private String aiTitle;

    @Column(name = "ai_diary", columnDefinition = "TEXT")
    private String aiDiary;

    @Builder.Default
    @Column(name = "ai_generate_count")
    private Integer aiGenerateCount = 0;

    @Column(name = "ai_status")
    private String aiStatus;

    @OneToMany(mappedBy = "memory", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Photo> photos = new ArrayList<>();

    @OneToMany(mappedBy = "memory", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MemoryMoment> moments = new ArrayList<>();

    @OneToMany(mappedBy = "memory", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MemoryDog> memoryDogs = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "representative_photo_id")
    private Photo representativePhoto;

    public void setRepresentativePhoto(Photo photo) {
        this.representativePhoto = photo;
    }
}
