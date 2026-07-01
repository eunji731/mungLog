package com.munglog.backend.domain.dashboard.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.dashboard.dto.AiReportResponse;
import com.munglog.backend.domain.dashboard.dto.DashboardSummaryResponse;
import com.munglog.backend.domain.dashboard.service.AiDashboardService;
import com.munglog.backend.domain.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 대시보드 컨트롤러.
 * 반려동물 월간 요약 통계와 AI 리포트를 제공하는 REST API 클래스.
 * 주요 기능: 월간 통계 조회, AI 리포트 조회/갱신
 */
@Tag(name = "대시보드", description = "대시보드 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AiDashboardService aiDashboardService;

    /**
     * [목적] 특정 월의 대시보드 요약 통계를 반환한다.
     * [설명] 기록된 날 수, 방문 장소 수, 베스트 사진, 즐겨 찾는 장소, 연속 기록 스트릭 정보를 포함한다.
     *        petId가 null이면 그룹 전체 기준, yearMonth가 null이면 이번 달 기준으로 조회한다.
     *
     * @param user      로그인한 사용자 정보 (Spring Security가 자동 주입)
     * @param petId     특정 반려동물 필터 (null이면 전체)
     * @param yearMonth 조회 연월 (예: "2025-07", null이면 현재 월)
     * @return 대시보드 요약 응답
     */
    @Operation(summary = "대시보드 요약 조회")
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) String yearMonth) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSummary(uuid(user), petId, yearMonth)));
    }

    /**
     * [목적] 특정 월의 AI 월간 리포트를 조회한다.
     * [설명] 이미 생성된 리포트가 있으면 캐시된 결과를 반환한다.
     *        리포트가 없으면 hasData = false로 응답한다.
     *
     * @param user      로그인한 사용자 정보
     * @param petId     특정 반려동물 필터 (null이면 전체)
     * @param yearMonth 조회 연월 (null이면 현재 월)
     * @return AI 리포트 응답 (hasData 포함)
     */
    @Operation(summary = "AI 월간 리포트 조회")
    @GetMapping("/ai-report")
    public ResponseEntity<ApiResponse<AiReportResponse>> getAiReport(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) String yearMonth) {
        return ResponseEntity.ok(ApiResponse.success(aiDashboardService.getReport(uuid(user), petId, yearMonth)));
    }

    /**
     * [목적] AI 월간 리포트를 새로 생성(갱신)한다.
     * [설명] Gemini AI를 호출하여 새 리포트를 생성하고 저장한다.
     *        하루 최대 3회 갱신 가능하며 초과 시 예외가 발생한다.
     *
     * @param user      로그인한 사용자 정보
     * @param petId     특정 반려동물 필터 (null이면 전체)
     * @param yearMonth 조회 연월 (null이면 현재 월)
     * @return 새로 생성된 AI 리포트 응답
     */
    @Operation(summary = "AI 월간 리포트 갱신")
    @PostMapping("/ai-report/refresh")
    public ResponseEntity<ApiResponse<AiReportResponse>> refreshAiReport(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) String yearMonth) {
        return ResponseEntity.ok(ApiResponse.success(aiDashboardService.refreshReport(uuid(user), petId, yearMonth)));
    }

    /**
     * [목적] Spring Security User 객체에서 UUID를 추출한다.
     * [설명] username 필드에 userId(UUID 문자열)가 저장되어 있다.
     *
     * @param user Spring Security User 객체
     * @return 사용자 UUID
     */
    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
