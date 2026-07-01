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

/**
 * 회원 정보 컨트롤러.
 * 로그인한 사용자 본인의 프로필 조회/수정, AI 컨텍스트 관리, 탈퇴/재가입을 처리하는 클래스.
 * 주요 기능: 내 정보 조회·수정, AI 컨텍스트 업데이트, 회원 탈퇴 및 재가입
 */
@Tag(name = "회원", description = "회원 정보 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;

    /**
     * [목적] 현재 로그인한 사용자의 프로필 정보를 조회
     * [설명] JWT 토큰에서 추출한 userId로 회원 정보를 가져와 반환한다.
     *        프로필 이미지 URL도 포함된다.
     *
     * @param user Spring Security가 주입하는 현재 로그인 사용자 정보
     * @return 회원 상세 정보 (닉네임, 이메일, 프로필 이미지, AI 컨텍스트 등)
     */
    @Operation(summary = "내 정보 조회")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MemberResponse>> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(memberService.getMe(uuid(user))));
    }

    /**
     * [목적] 현재 로그인한 사용자의 프로필을 수정
     * [설명] 닉네임과 프로필 이미지를 multipart/form-data 형식으로 받아 업데이트한다.
     *        이미지가 없으면 기존 이미지를 유지한다.
     *
     * @param user         Spring Security가 주입하는 현재 로그인 사용자 정보
     * @param request      수정할 닉네임을 담은 요청 DTO
     * @param profileImage (선택) 새로 업로드할 프로필 이미지 파일
     * @return 수정된 회원 정보
     */
    @Operation(summary = "내 정보 수정")
    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MemberResponse>> updateMe(
            @AuthenticationPrincipal User user,
            @RequestPart("data") MemberUpdateRequest request,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        return ResponseEntity.ok(ApiResponse.success(memberService.updateMe(uuid(user), request, profileImage)));
    }

    /**
     * [목적] AI 다이어리 생성에 활용할 사용자 컨텍스트 정보를 업데이트
     * [설명] AI가 사용자 맞춤형 다이어리를 작성할 때 참고하는 배경 정보(예: 반려동물 특징, 가족 정보 등)를 저장한다.
     *
     * @param user Spring Security가 주입하는 현재 로그인 사용자 정보
     * @param body "aiContext" 키로 컨텍스트 문자열을 담은 요청 바디
     * @return 성공 응답 (본문 없음)
     */
    @Operation(summary = "AI 컨텍스트 수정")
    @PutMapping("/me/ai-context")
    public ResponseEntity<ApiResponse<Void>> updateAiContext(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        memberService.updateAiContext(uuid(user), body.get("aiContext"));
        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * [목적] 현재 로그인한 사용자의 회원 탈퇴 처리
     * [설명] 사용자 계정을 비활성화(isActive=false)하고 토큰을 무효화한다.
     *        소유 중인 반려동물도 비활성화된다.
     *
     * @param user Spring Security가 주입하는 현재 로그인 사용자 정보
     * @return 성공 응답 (본문 없음)
     */
    @Operation(summary = "회원 탈퇴")
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> withdraw(@AuthenticationPrincipal User user) {
        memberService.withdraw(uuid(user));
        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * [목적] 탈퇴한 사용자가 재가입하여 계정을 복구
     * [설명] 재가입 전용 JWT 토큰을 검증한 뒤 계정을 다시 활성화(isActive=true)한다.
     *        재가입 토큰은 10분간 유효하며, 탈퇴 직후 발급된다.
     *
     * @param user  Spring Security가 주입하는 현재 로그인 사용자 정보
     * @param token 재가입용 JWT 토큰 (탈퇴 시 발급)
     * @return 성공 응답 (본문 없음)
     * @throws IllegalArgumentException 토큰이 유효하지 않거나 재가입 토큰이 아닌 경우
     * @throws SecurityException        토큰의 userId와 현재 사용자가 불일치하는 경우
     */
    @Operation(summary = "재가입")
    @PostMapping("/rejoin")
    public ResponseEntity<ApiResponse<Void>> rejoin(
            @AuthenticationPrincipal User user,
            @RequestParam String token) {
        memberService.rejoin(uuid(user), token);
        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * [목적] Spring Security User 객체에서 UUID를 추출하는 헬퍼 메소드
     * [설명] JWT 토큰의 subject(userId)를 UUID 타입으로 변환한다.
     *
     * @param user Spring Security의 인증된 사용자 객체
     * @return 사용자 UUID
     */
    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
