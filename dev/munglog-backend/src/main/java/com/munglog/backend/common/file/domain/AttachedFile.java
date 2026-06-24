package com.munglog.backend.common.file.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "attached_files", indexes = {
        @Index(name = "idx_attached_files_parent", columnList = "parent_type, parent_id")
})
public class AttachedFile extends BaseTimeEntity {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "parent_type", nullable = false, length = 30)
    private ParentDomainType parentType;

    @Column(name = "parent_id", nullable = false, columnDefinition = "UUID")
    private UUID parentId;

    @Column(name = "original_name")
    private String originalName;

    @Column(name = "stored_path", nullable = false)
    private String storedPath;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Builder
    public AttachedFile(ParentDomainType parentType, UUID parentId, String originalName,
                        String storedPath, String contentType, Long fileSize, Integer sortOrder) {
        this.parentType = parentType;
        this.parentId = parentId;
        this.originalName = originalName;
        this.storedPath = storedPath;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.sortOrder = sortOrder;
    }
}
