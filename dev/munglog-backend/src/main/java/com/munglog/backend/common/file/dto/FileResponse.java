package com.munglog.backend.common.file.dto;

import com.munglog.backend.common.file.domain.AttachedFile;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

/**
 * 첨부파일 조회 응답 DTO 클래스.
 * AttachedFile 엔티티를 클라이언트에 전달할 형태로 변환한다.
 * fileUrl은 스토리지 유형(로컬/S3)에 따라 달라진다.
 */
@Getter
@Builder
public class FileResponse {

    /** 첨부파일 고유 UUID */
    private UUID id;

    /** 사용자가 업로드한 원본 파일명 */
    private String originalName;

    /** 클라이언트가 접근 가능한 파일 URL */
    private String fileUrl;

    /** 파일 MIME 타입 (예: image/jpeg) */
    private String contentType;

    /** 파일 크기 (바이트 단위) */
    private Long fileSize;

    /** 파일 목록 출력 순서 */
    private Integer sortOrder;

    /** 파일 업로드 일시 */
    private Instant createdAt;

    /**
     * [목적] AttachedFile 엔티티와 접근 URL을 FileResponse DTO로 변환한다.
     *
     * @param file    변환할 AttachedFile 엔티티
     * @param fileUrl 스토리지에서 생성한 접근 URL
     * @return 변환된 FileResponse DTO
     */
    public static FileResponse from(AttachedFile file, String fileUrl) {
        return FileResponse.builder()
                .id(file.getId())
                .originalName(file.getOriginalName())
                .fileUrl(fileUrl)
                .contentType(file.getContentType())
                .fileSize(file.getFileSize())
                .sortOrder(file.getSortOrder())
                .createdAt(file.getCreatedAt())
                .build();
    }
}
