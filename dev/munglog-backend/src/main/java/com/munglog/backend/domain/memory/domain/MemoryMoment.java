package com.munglog.backend.domain.memory.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tb_memory_moment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MemoryMoment extends BaseTimeEntity {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memory_id", nullable = false)
    private Memory memory;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "category")
    private String category;

    @Column(name = "ai_title")
    private String aiTitle;

    @Column(name = "ai_content", columnDefinition = "TEXT")
    private String aiContent;

    @Column(name = "location_name")
    private String locationName;

    @Column(name = "energy_level")
    private String energyLevel;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;

    @Column(name = "representative_photo_path")
    private String representativePhotoPath;

    @OneToMany(mappedBy = "moment", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Photo> photos = new ArrayList<>();
}
