package com.munglog.backend.common.file.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * 스토리지에 저장된 파일의 메타데이터를 담는 DTO 클래스.
 * 파일 저장 결과를 서비스 계층 간에 전달하거나, EXIF 정보(촬영일시, GPS 좌표)를 함께 전달할 때 사용한다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoredFileInfo {
    /** 사용자가 업로드한 원본 파일명 */
    private String originalName;

    /** 서버에 저장된 파일의 상대 경로(로컬) 또는 S3 키 */
    private String storedPath;

    /** 클라이언트가 접근 가능한 파일 URL */
    private String fileUrl;

    /** 파일 MIME 타입 (예: image/jpeg) */
    private String contentType;

    /** 파일 크기 (바이트 단위) */
    private Long fileSize;

    /** 사진 촬영 일시 (EXIF 데이터, 없으면 null) */
    private LocalDateTime takenAt;

    /** 촬영 위치 위도 (EXIF GPS 데이터, 없으면 null) */
    private Double latitude;

    /** 촬영 위치 경도 (EXIF GPS 데이터, 없으면 null) */
    private Double longitude;
}
