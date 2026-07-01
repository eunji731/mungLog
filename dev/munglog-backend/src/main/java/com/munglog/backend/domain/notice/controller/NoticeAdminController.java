package com.munglog.backend.domain.notice.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.notice.dto.NoticeRequest;
import com.munglog.backend.domain.notice.dto.NoticeResponse;
import com.munglog.backend.domain.notice.service.NoticeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "관리자 - 공지사항", description = "공지사항 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/notices")
public class NoticeAdminController {

    private final NoticeService noticeService;

    @Operation(summary = "공지사항 등록")
    @PostMapping
    public ResponseEntity<ApiResponse<NoticeResponse>> create(
            @AuthenticationPrincipal User user,
            @RequestBody NoticeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.create(uuid(user), request)));
    }

    @Operation(summary = "공지사항 수정")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticeResponse>> update(
            @PathVariable UUID id,
            @RequestBody NoticeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.update(id, request)));
    }

    @Operation(summary = "공지사항 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        noticeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
