package com.munglog.backend.domain.inquiry.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.inquiry.dto.InquiryRequest;
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
 * 사용자용 1:1 문의 컨트롤러.
 * 문의 작성, 내 문의 조회, 답변 읽음 처리 API를 제공한다.
 * 경로: /api/inquiries (로그인 필요)
 */
@Tag(name = "문의", description = "1:1 문의 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inquiries")
public class InquiryController {

    private final InquiryService inquiryService;

    @Operation(summary = "문의 작성")
    @PostMapping
    public ResponseEntity<ApiResponse<InquiryResponse>> create(
            @AuthenticationPrincipal User user,
            @RequestBody InquiryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(inquiryService.create(uuid(user), request)));
    }

    @Operation(summary = "내 문의 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<InquiryResponse>>> getMyInquiries(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(inquiryService.getMyInquiries(uuid(user))));
    }

    @Operation(summary = "문의 답변 읽음 처리")
    @PatchMapping("/{inquiryId}/read-reply")
    public ResponseEntity<ApiResponse<InquiryResponse>> markReplyRead(
            @AuthenticationPrincipal User user,
            @PathVariable UUID inquiryId) {
        return ResponseEntity.ok(ApiResponse.success(inquiryService.markReplyRead(inquiryId, uuid(user))));
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
