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

@Tag(name = "첨부파일", description = "도메인별 첨부파일 관리 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/files")
public class AttachedFileController {

    private final AttachedFileService attachedFileService;

    @Operation(summary = "첨부파일 목록 조회")
    @GetMapping("/{parentType}/{parentId}")
    public ApiResponse<List<FileResponse>> getFiles(
            @PathVariable String parentType,
            @PathVariable UUID parentId) {
        return ApiResponse.success(attachedFileService.getFiles(
                ParentDomainType.valueOf(parentType.toUpperCase()), parentId));
    }

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
