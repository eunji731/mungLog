package com.munglog.backend.domain.notice.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.notice.dto.NoticeResponse;
import com.munglog.backend.domain.notice.service.NoticeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "공지사항", description = "공지사항 조회 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notices")
public class NoticeController {

    private final NoticeService noticeService;

    @Operation(summary = "공지사항 목록 조회 (읽음 여부 포함)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<NoticeResponse>>> getAll(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.getAll(uuid(user))));
    }

    @Operation(summary = "공지사항 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticeResponse>> getOne(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.getOne(id, uuid(user))));
    }

    @Operation(summary = "공지사항 전체 읽음 처리")
    @PatchMapping("/read")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal User user) {
        noticeService.markAllRead(uuid(user));
        return ResponseEntity.ok(ApiResponse.success());
    }

    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
