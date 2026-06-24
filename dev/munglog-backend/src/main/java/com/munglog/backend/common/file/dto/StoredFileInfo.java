package com.munglog.backend.common.file.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoredFileInfo {
    private String originalName;
    private String storedPath;
    private String fileUrl;
    private String contentType;
    private Long fileSize;
    private LocalDateTime takenAt;
    private Double latitude;
    private Double longitude;
}
