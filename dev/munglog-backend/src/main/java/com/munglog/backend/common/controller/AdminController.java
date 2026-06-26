package com.munglog.backend.common.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.memory.service.ThumbnailMigrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ThumbnailMigrationService thumbnailMigrationService;

    @PostMapping("/migrate-thumbnails")
    public ResponseEntity<ApiResponse<ThumbnailMigrationService.MigrationResult>> migrateThumbnails() {
        return ResponseEntity.ok(ApiResponse.success(thumbnailMigrationService.migrate()));
    }
}
