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

/**
 * 사진 아카이브 컨트롤러.
 * AI가 분류한 테마 태그 기반으로 사진을 조회·검색하는 API 엔드포인트를 제공한다.
 * 주요 기능: 테마 탭 목록, 베스트 사진, 테마별 사진 조회, 태그 자동완성
 */
@Tag(name = "아카이브", description = "사진 아카이브 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/archive")
public class ArchiveController {

    private final ArchiveService archiveService;

    /**
     * [목적] 그룹 내 사진에 붙은 테마 태그를 탭 형태로 조회한다.
     *
     * @param user 현재 로그인한 사용자
     * @return 테마 태그명, 사진 수, 대표 사진 URL이 담긴 탭 목록
     */
    @Operation(summary = "테마 탭 목록 조회")
    @GetMapping("/themes")
    public ResponseEntity<ApiResponse<List<ThemeTabResponse>>> getThemes(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(archiveService.getThemes(uuid(user))));
    }

    /**
     * [목적] 그룹 내 베스트(isBest=true) 사진 목록을 조회한다.
     *
     * @param user 현재 로그인한 사용자
     * @return 베스트 사진 응답 DTO 목록
     */
    @Operation(summary = "베스트 사진 조회")
    @GetMapping("/photos")
    public ResponseEntity<ApiResponse<List<ArchivePhotoResponse>>> getBestPhotos(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(archiveService.getBestPhotos(uuid(user))));
    }

    /**
     * [목적] 특정 테마 태그에 속한 사진 목록을 조회한다.
     *
     * @param user 현재 로그인한 사용자
     * @param tag  조회할 테마 태그명
     * @return 해당 테마의 사진 응답 DTO 목록
     */
    @Operation(summary = "테마별 사진 조회")
    @GetMapping("/themes/{tag}")
    public ResponseEntity<ApiResponse<List<ArchivePhotoResponse>>> getPhotosByTheme(
            @AuthenticationPrincipal User user,
            @PathVariable String tag) {
        return ResponseEntity.ok(ApiResponse.success(archiveService.getPhotosByTheme(uuid(user), tag)));
    }

    /**
     * [목적] 키워드로 테마 태그를 검색하여 해당 사진 목록을 반환한다.
     *
     * @param user    현재 로그인한 사용자
     * @param keyword 검색 키워드
     * @return 키워드가 포함된 테마의 사진 응답 DTO 목록
     */
    @Operation(summary = "테마 검색")
    @GetMapping("/themes/search")
    public ResponseEntity<ApiResponse<List<ArchivePhotoResponse>>> searchThemes(
            @AuthenticationPrincipal User user,
            @RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success(archiveService.searchByTheme(uuid(user), keyword)));
    }

    /**
     * [목적] 입력한 접두어로 시작하는 태그 목록을 자동완성으로 제안한다.
     *
     * @param user   현재 로그인한 사용자
     * @param prefix 자동완성 검색 접두어
     * @return 매칭되는 태그 문자열 목록
     */
    @Operation(summary = "태그 자동완성")
    @GetMapping("/tags/suggest")
    public ResponseEntity<ApiResponse<List<String>>> suggestTags(
            @AuthenticationPrincipal User user,
            @RequestParam String prefix) {
        return ResponseEntity.ok(ApiResponse.success(archiveService.suggestTags(uuid(user), prefix)));
    }

    /**
     * [목적] Spring Security User 객체에서 사용자 UUID를 추출한다.
     *
     * @param user Spring Security 인증 객체
     * @return 사용자 UUID
     */
    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
