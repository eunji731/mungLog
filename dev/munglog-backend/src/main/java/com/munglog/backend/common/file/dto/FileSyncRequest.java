package com.munglog.backend.common.file.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * 파일 동기화 요청 DTO 클래스.
 * 파일 편집 시 삭제할 파일 UUID 목록을 전달하는 데 사용한다.
 * AttachedFileController의 syncFiles API 요청 본문으로 사용된다.
 */
@Getter
@NoArgsConstructor
public class FileSyncRequest {
    /** 삭제할 첨부파일 UUID 목록 */
    private List<UUID> deletedFileIds;
}
