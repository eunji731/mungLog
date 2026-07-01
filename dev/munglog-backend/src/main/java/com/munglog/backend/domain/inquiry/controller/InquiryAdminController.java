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

/**
 * 관리자용 문의 관리 컨트롤러.
 * 관리자가 사용자 문의를 조회하고 답변을 등록하는 API를 제공한다.
 * 경로: /api/admin/inquiries (ROLE_ADMIN 권한 필요)
 */
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

    /**
     * [목적] Spring Security User 객체에서 UUID를 추출한다.
     *
     * @param user Spring Security 인증 주체 (username = 사용자 UUID 문자열)
     * @return 사용자 UUID
     */
    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
