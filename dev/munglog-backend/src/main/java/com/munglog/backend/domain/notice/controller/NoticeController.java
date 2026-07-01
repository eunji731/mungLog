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

/**
 * 일반 사용자용 공지사항 컨트롤러.
 * 공지사항 목록·상세 조회 및 읽음 처리 기능을 제공하는 REST API 컨트롤러.
 * 기본 경로: /api/notices
 */
@Tag(name = "공지사항", description = "공지사항 조회 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notices")
public class NoticeController {

    private final NoticeService noticeService;

    /**
     * [목적] 전체 공지사항 목록을 최신순으로 조회한다.
     * [설명] 로그인한 사용자의 마지막 읽음 시각과 비교하여 각 공지의 '새 글 여부(isNew)'를 함께 반환한다.
     *
     * @param user 스프링 시큐리티 인증 객체
     * @return 읽음 여부가 포함된 공지사항 목록
     */
    @Operation(summary = "공지사항 목록 조회 (읽음 여부 포함)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<NoticeResponse>>> getAll(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.getAll(uuid(user))));
    }

    /**
     * [목적] 특정 공지사항의 상세 내용을 조회한다.
     * [설명] 공지 ID와 현재 사용자 정보를 이용해 단건 공지사항과 읽음 여부를 반환한다.
     *
     * @param user 스프링 시큐리티 인증 객체
     * @param id   조회할 공지사항 UUID
     * @return 공지사항 상세 응답 DTO
     */
    @Operation(summary = "공지사항 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticeResponse>> getOne(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(noticeService.getOne(id, uuid(user))));
    }

    /**
     * [목적] 사용자의 공지사항 전체 읽음 상태를 갱신한다.
     * [설명] 현재 시각을 사용자의 lastNoticeReadAt 필드에 저장하여, 이후 조회 시 새 글이 없는 상태로 표시된다.
     *
     * @param user 스프링 시큐리티 인증 객체
     * @return 빈 성공 응답
     */
    @Operation(summary = "공지사항 전체 읽음 처리")
    @PatchMapping("/read")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal User user) {
        noticeService.markAllRead(uuid(user));
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
