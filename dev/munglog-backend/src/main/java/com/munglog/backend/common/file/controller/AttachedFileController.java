package com.munglog.backend.common.file.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.common.file.dto.FileSyncRequest;
import com.munglog.backend.common.file.service.AttachedFileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * 도메인별 첨부파일을 관리하는 REST 컨트롤러.
 * 파일 조회, 추가, 동기화(삭제+추가), 단일 교체 기능을 제공한다.
 * parentType은 ParentDomainType 열거형으로 지정하며, URL 경로에 소문자로 입력한다.
 */
@Tag(name = "첨부파일", description = "도메인별 첨부파일 관리 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/files")
public class AttachedFileController {

    private final AttachedFileService attachedFileService;

    /**
     * [목적] 특정 도메인 엔티티에 연결된 첨부파일 목록을 조회한다.
     *
     * @param parentType 파일이 속한 도메인 타입 (예: "memory", "care")
     * @param parentId   파일이 속한 부모 엔티티 UUID
     * @return 첨부파일 목록 응답
     */
    @Operation(summary = "첨부파일 목록 조회")
    @GetMapping("/{parentType}/{parentId}")
    public ApiResponse<List<FileResponse>> getFiles(
            @PathVariable String parentType,
            @PathVariable UUID parentId) {
        return ApiResponse.success(attachedFileService.getFiles(
                ParentDomainType.valueOf(parentType.toUpperCase()), parentId));
    }

    /**
     * [목적] 기존 파일을 유지하면서 새 파일을 추가한다.
     *
     * @param parentType 파일이 속한 도메인 타입
     * @param parentId   파일이 속한 부모 엔티티 UUID
     * @param files      추가할 파일 목록
     * @return 저장된 파일 목록 응답
     */
    @Operation(summary = "파일 추가 (기존 유지)")
    @PostMapping("/{parentType}/{parentId}/sync")
    public ApiResponse<List<FileResponse>> addFiles(
            @PathVariable String parentType,
            @PathVariable UUID parentId,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {
        ParentDomainType type = ParentDomainType.valueOf(parentType.toUpperCase());
        List<FileResponse> saved = attachedFileService.saveAll(type, parentId, files);
        return ApiResponse.success(saved);
    }

    /**
     * [목적] 삭제할 파일과 추가할 파일을 동시에 처리하여 파일 목록을 동기화한다.
     * [설명] 프론트에서 파일 편집 후 최종 상태를 서버에 반영할 때 사용한다.
     *        deletedFileIds에 포함된 파일은 삭제하고, files로 전달된 파일은 새로 추가한다.
     *
     * @param parentType 파일이 속한 도메인 타입
     * @param parentId   파일이 속한 부모 엔티티 UUID
     * @param files      새로 추가할 파일 목록
     * @param request    삭제할 파일 ID 목록 (deletedFileIds)
     * @return 동기화 후 전체 파일 목록 응답
     */
    @Operation(summary = "파일 동기화 (삭제 + 추가)")
    @PutMapping("/{parentType}/{parentId}/sync")
    public ApiResponse<List<FileResponse>> syncFiles(
            @PathVariable String parentType,
            @PathVariable UUID parentId,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestBody(required = false) FileSyncRequest request) {
        ParentDomainType type = ParentDomainType.valueOf(parentType.toUpperCase());
        List<UUID> deletedIds = request != null ? request.getDeletedFileIds() : List.of();
        return ApiResponse.success(attachedFileService.syncFiles(type, parentId, deletedIds, files));
    }

    /**
     * [목적] 기존 파일을 모두 삭제하고 새 파일 하나로 교체한다.
     * [설명] 프로필 이미지처럼 단일 파일만 허용하는 경우에 사용한다.
     *
     * @param parentType 파일이 속한 도메인 타입
     * @param parentId   파일이 속한 부모 엔티티 UUID
     * @param file       교체할 새 파일
     * @return 새로 저장된 파일 응답
     */
    @Operation(summary = "단일 파일 교체")
    @PutMapping("/{parentType}/{parentId}/replace")
    public ApiResponse<FileResponse> replaceSingle(
            @PathVariable String parentType,
            @PathVariable UUID parentId,
            @RequestParam("file") MultipartFile file) {
        ParentDomainType type = ParentDomainType.valueOf(parentType.toUpperCase());
        return ApiResponse.success(attachedFileService.replaceSingle(type, parentId, file));
    }
}
