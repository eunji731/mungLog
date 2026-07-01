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

/**
 * 관리자 공지사항 컨트롤러.
 * 공지사항의 등록·수정·삭제 기능을 제공하는 관리자 전용 REST API 컨트롤러.
 * 기본 경로: /api/admin/notices
 */
@Tag(name = "관리자 - 공지사항", description = "공지사항 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/notices")
public class NoticeAdminController {

    private final NoticeService noticeService;

    /**
     * [목적] 새 공지사항을 등록한다.
     * [설명] 로그인한 관리자 정보와 요청 본문의 제목·내용을 받아 공지사항을 저장한다.
     *
     * @param user    스프링 시큐리티 인증 객체 (관리자 UUID 포함)
     * @param request 공지사항 제목·내용 DTO
     * @return 저장된 공지사항 응답 DTO
     */
    @Operation(summary = "공지사항 등록")
    @PostMapping
    public ResponseEntity<ApiResponse<NoticeResponse>> create(
            @AuthenticationPrincipal User user,
            @RequestBody NoticeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.create(uuid(user), request)));
    }

    /**
     * [목적] 기존 공지사항을 수정한다.
     * [설명] 경로에 지정된 ID의 공지사항을 요청 본문의 내용으로 덮어쓴다.
     *
     * @param id      수정할 공지사항의 UUID
     * @param request 새 제목·내용 DTO
     * @return 수정된 공지사항 응답 DTO
     */
    @Operation(summary = "공지사항 수정")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticeResponse>> update(
            @PathVariable UUID id,
            @RequestBody NoticeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.update(id, request)));
    }

    /**
     * [목적] 공지사항을 삭제한다.
     * [설명] 경로에 지정된 ID의 공지사항을 DB에서 완전히 제거한다.
     *
     * @param id 삭제할 공지사항의 UUID
     * @return 빈 성공 응답
     */
    @Operation(summary = "공지사항 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        noticeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * [목적] 인증 객체에서 사용자 UUID를 추출한다.
     *
     * @param user 스프링 시큐리티 User 객체 (username = UUID 문자열)
     * @return 변환된 UUID
     */
    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
