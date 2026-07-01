package com.munglog.backend.common.file.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

/**
 * 도메인별 첨부파일 정보를 저장하는 엔티티 클래스.
 * 다양한 도메인(메모리, 케어, 반려동물 프로필 등)의 파일을 하나의 테이블로 통합 관리한다.
 * parentType + parentId 조합으로 어떤 도메인 엔티티에 속한 파일인지 식별한다.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "attached_files", indexes = {
        @Index(name = "idx_attached_files_parent", columnList = "parent_type, parent_id")
})
public class AttachedFile extends BaseTimeEntity {

    /** 첨부파일 고유 UUID (자동 생성) */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "UUID")
    private UUID id;

    /** 파일이 속한 도메인 타입 (예: MEMORY, PET_PROFILE) */
    @Enumerated(EnumType.STRING)
    @Column(name = "parent_type", nullable = false, length = 30)
    private ParentDomainType parentType;

    /** 파일이 속한 부모 엔티티 UUID */
    @Column(name = "parent_id", nullable = false, columnDefinition = "UUID")
    private UUID parentId;

    /** 사용자가 업로드한 원본 파일명 */
    @Column(name = "original_name")
    private String originalName;

    /** 서버에 저장된 파일의 상대 경로(로컬) 또는 S3 키 */
    @Column(name = "stored_path", nullable = false)
    private String storedPath;

    /** 파일 MIME 타입 (예: image/jpeg) */
    @Column(name = "content_type", length = 100)
    private String contentType;

    /** 파일 크기 (바이트 단위) */
    @Column(name = "file_size")
    private Long fileSize;

    /** 파일 목록 출력 순서 (오름차순) */
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
