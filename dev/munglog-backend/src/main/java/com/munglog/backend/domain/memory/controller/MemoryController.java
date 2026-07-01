package com.munglog.backend.domain.memory.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.memory.dto.MemoryDetailResponse;
import com.munglog.backend.domain.memory.dto.MemoryListResponse;
import com.munglog.backend.domain.memory.service.MemoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 반려동물 일지(Memory) 컨트롤러.
 * 반려동물과의 하루 기록(일지) 목록 조회, 상세 조회, 삭제를 처리하는 클래스.
 * 주요 기능: 일지 목록 조회 (날짜 필터링), 일지 상세 조회, 일지 삭제
 */
@Tag(name = "일지", description = "반려동물 일지 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/memories")
public class MemoryController {

    private final MemoryService memoryService;

    /**
     * [목적] 사용자의 가족 그룹에 속한 일지 목록을 조회
     * [설명] 날짜 범위(startDate~endDate)가 있으면 해당 기간 일지만, 없으면 전체 일지를 최신순으로 반환한다.
     *
     * @param user      Spring Security가 주입하는 현재 로그인 사용자 정보
     * @param startDate (선택) 조회 시작일 (ISO 형식: yyyy-MM-dd)
     * @param endDate   (선택) 조회 종료일 (ISO 형식: yyyy-MM-dd)
     * @return 일지 목록 (대표 사진, 순간 요약, 반려동물 목록 포함)
     */
    @Operation(summary = "일지 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<MemoryListResponse>>> getMemories(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(
                memoryService.getMemories(UUID.fromString(user.getUsername()), startDate, endDate)));
    }

    /**
     * [목적] 특정 일지의 상세 정보를 조회
     * [설명] memoryId로 일지를 조회하고 모든 순간(Moment), 사진, 반려동물 정보를 함께 반환한다.
     *        그룹 소속 여부를 검증하여 다른 그룹의 일지는 조회할 수 없다.
     *
     * @param user     Spring Security가 주입하는 현재 로그인 사용자 정보
     * @param memoryId 조회할 일지의 UUID
     * @return 일지 상세 정보 (순간 목록, 사진, GPS 좌표 포함)
     * @throws IllegalArgumentException 일지를 찾을 수 없는 경우
     */
    @Operation(summary = "일지 상세 조회")
    @GetMapping("/{memoryId}")
    public ResponseEntity<ApiResponse<MemoryDetailResponse>> getMemory(
            @AuthenticationPrincipal User user,
            @PathVariable UUID memoryId) {
        return ResponseEntity.ok(ApiResponse.success(
                memoryService.getMemoryDetail(memoryId, UUID.fromString(user.getUsername()))));
    }

    /**
     * [목적] 특정 일지를 삭제
     * [설명] memoryId에 해당하는 일지와 연결된 첨부 파일을 함께 삭제한다.
     *        본인이 생성한 일지만 삭제 가능하다.
     *
     * @param user     Spring Security가 주입하는 현재 로그인 사용자 정보
     * @param memoryId 삭제할 일지의 UUID
     * @return 성공 응답 (본문 없음)
     * @throws IllegalArgumentException 일지를 찾을 수 없는 경우
     */
    @Operation(summary = "일지 삭제")
    @DeleteMapping("/{memoryId}")
    public ResponseEntity<ApiResponse<Void>> deleteMemory(
            @AuthenticationPrincipal User user,
            @PathVariable UUID memoryId) {
        memoryService.deleteMemory(memoryId, UUID.fromString(user.getUsername()));
        return ResponseEntity.ok(ApiResponse.success());
    }
}
