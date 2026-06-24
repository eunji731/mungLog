package com.munglog.backend.common.file.dto;

import com.munglog.backend.common.file.domain.AttachedFile;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class FileResponse {

    private UUID id;
    private String originalName;
    private String fileUrl;
    private String contentType;
    private Long fileSize;
    private Integer sortOrder;
    private Instant createdAt;

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
