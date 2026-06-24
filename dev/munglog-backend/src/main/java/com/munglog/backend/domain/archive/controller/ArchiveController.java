package com.munglog.backend.domain.archive.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.archive.dto.ArchivePhotoResponse;
import com.munglog.backend.domain.archive.dto.ThemeTabResponse;
import com.munglog.backend.domain.archive.service.ArchiveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "아카이브", description = "사진 아카이브 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/archive")
public class ArchiveController {

    private final ArchiveService archiveService;

    @Operation(summary = "테마 탭 목록 조회")
    @GetMapping("/themes")
    public ResponseEntity<ApiResponse<List<ThemeTabResponse>>> getThemes(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(archiveService.getThemes(uuid(user))));
    }

    @Operation(summary = "베스트 사진 조회")
    @GetMapping("/photos")
    public ResponseEntity<ApiResponse<List<ArchivePhotoResponse>>> getBestPhotos(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(archiveService.getBestPhotos(uuid(user))));
    }

    @Operation(summary = "테마별 사진 조회")
    @GetMapping("/themes/{tag}")
    public ResponseEntity<ApiResponse<List<ArchivePhotoResponse>>> getPhotosByTheme(
            @AuthenticationPrincipal User user,
            @PathVariable String tag) {
        return ResponseEntity.ok(ApiResponse.success(archiveService.getPhotosByTheme(uuid(user), tag)));
    }

    @Operation(summary = "테마 검색")
    @GetMapping("/themes/search")
    public ResponseEntity<ApiResponse<List<ArchivePhotoResponse>>> searchThemes(
            @AuthenticationPrincipal User user,
            @RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success(archiveService.searchByTheme(uuid(user), keyword)));
    }

    @Operation(summary = "태그 자동완성")
    @GetMapping("/tags/suggest")
    public ResponseEntity<ApiResponse<List<String>>> suggestTags(
            @AuthenticationPrincipal User user,
            @RequestParam String prefix) {
        return ResponseEntity.ok(ApiResponse.success(archiveService.suggestTags(uuid(user), prefix)));
    }

    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
