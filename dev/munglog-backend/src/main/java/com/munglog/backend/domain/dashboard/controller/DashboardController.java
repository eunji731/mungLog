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

@Tag(name = "대시보드", description = "대시보드 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AiDashboardService aiDashboardService;

    @Operation(summary = "대시보드 요약 조회")
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) UUID petId) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSummary(uuid(user), petId)));
    }

    @Operation(summary = "AI 월간 리포트 조회")
    @GetMapping("/ai-report")
    public ResponseEntity<ApiResponse<AiReportResponse>> getAiReport(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) String yearMonth) {
        return ResponseEntity.ok(ApiResponse.success(aiDashboardService.getReport(uuid(user), petId, yearMonth)));
    }

    @Operation(summary = "AI 월간 리포트 갱신")
    @PostMapping("/ai-report/refresh")
    public ResponseEntity<ApiResponse<AiReportResponse>> refreshAiReport(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) String yearMonth) {
        return ResponseEntity.ok(ApiResponse.success(aiDashboardService.refreshReport(uuid(user), petId, yearMonth)));
    }

    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
