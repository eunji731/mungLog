package com.munglog.backend.domain.inquiry.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.inquiry.dto.InquiryReplyRequest;
import com.munglog.backend.domain.inquiry.dto.InquiryResponse;
import com.munglog.backend.domain.inquiry.service.InquiryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "관리자 - 문의", description = "문의 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/inquiries")
public class InquiryAdminController {

    private final InquiryService inquiryService;

    @Operation(summary = "미읽음 문의 수 조회")
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        return ResponseEntity.ok(ApiResponse.success(inquiryService.getUnreadCountForAdmin()));
    }

    @Operation(summary = "전체 문의 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<InquiryResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(inquiryService.getAllForAdmin()));
    }

    @Operation(summary = "문의 읽음 처리 (관리자)")
    @PatchMapping("/{inquiryId}/read")
    public ResponseEntity<ApiResponse<InquiryResponse>> markRead(@PathVariable UUID inquiryId) {
        return ResponseEntity.ok(ApiResponse.success(inquiryService.markAdminRead(inquiryId)));
    }

    @Operation(summary = "문의 답변 등록")
    @PostMapping("/{inquiryId}/reply")
    public ResponseEntity<ApiResponse<InquiryResponse>> reply(
            @AuthenticationPrincipal User user,
            @PathVariable UUID inquiryId,
            @RequestBody InquiryReplyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(inquiryService.reply(inquiryId, uuid(user), request)));
    }

    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
