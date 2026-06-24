package com.munglog.backend.domain.schedule.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.schedule.dto.ScheduleRequest;
import com.munglog.backend.domain.schedule.dto.ScheduleResponse;
import com.munglog.backend.domain.schedule.service.ScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "일정", description = "반려동물 일정 관리 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @Operation(summary = "일정 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getSchedules(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) UUID petId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getSchedules(uuid(user), petId)));
    }

    @Operation(summary = "일정 상세 조회")
    @GetMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> getSchedule(
            @AuthenticationPrincipal User user,
            @PathVariable UUID scheduleId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getSchedule(scheduleId, uuid(user))));
    }

    @Operation(summary = "일정 등록")
    @PostMapping
    public ResponseEntity<ApiResponse<ScheduleResponse>> createSchedule(
            @AuthenticationPrincipal User user,
            @RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.createSchedule(uuid(user), request)));
    }

    @Operation(summary = "일정 수정")
    @PutMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> updateSchedule(
            @AuthenticationPrincipal User user,
            @PathVariable UUID scheduleId,
            @RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.updateSchedule(scheduleId, uuid(user), request)));
    }

    @Operation(summary = "일정 삭제")
    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(
            @AuthenticationPrincipal User user,
            @PathVariable UUID scheduleId) {
        scheduleService.deleteSchedule(scheduleId, uuid(user));
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "일정 완료 토글")
    @PatchMapping("/{scheduleId}/completion")
    public ResponseEntity<ApiResponse<ScheduleResponse>> toggleCompletion(
            @AuthenticationPrincipal User user,
            @PathVariable UUID scheduleId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.toggleCompletion(scheduleId, uuid(user))));
    }

    @Operation(summary = "일정 → 케어 기록 전환")
    @PostMapping("/{scheduleId}/convert")
    public ResponseEntity<ApiResponse<UUID>> convertToCareRecord(
            @AuthenticationPrincipal User user,
            @PathVariable UUID scheduleId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.convertToCareRecord(scheduleId, uuid(user))));
    }

    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
