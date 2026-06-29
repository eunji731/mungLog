package com.munglog.backend.domain.member.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.member.dto.MemberResponse;
import com.munglog.backend.domain.member.dto.MemberUpdateRequest;
import com.munglog.backend.domain.member.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@Tag(name = "회원", description = "회원 정보 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;

    @Operation(summary = "내 정보 조회")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MemberResponse>> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(memberService.getMe(uuid(user))));
    }

    @Operation(summary = "내 정보 수정")
    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MemberResponse>> updateMe(
            @AuthenticationPrincipal User user,
            @RequestPart("data") MemberUpdateRequest request,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        return ResponseEntity.ok(ApiResponse.success(memberService.updateMe(uuid(user), request, profileImage)));
    }

    @Operation(summary = "AI 컨텍스트 수정")
    @PutMapping("/me/ai-context")
    public ResponseEntity<ApiResponse<Void>> updateAiContext(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        memberService.updateAiContext(uuid(user), body.get("aiContext"));
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "회원 탈퇴")
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> withdraw(@AuthenticationPrincipal User user) {
        memberService.withdraw(uuid(user));
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "재가입")
    @PostMapping("/rejoin")
    public ResponseEntity<ApiResponse<Void>> rejoin(
            @AuthenticationPrincipal User user,
            @RequestParam String token) {
        memberService.rejoin(uuid(user), token);
        return ResponseEntity.ok(ApiResponse.success());
    }

    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
