package com.munglog.backend.domain.schedule.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.schedule.dto.ScheduleRequest;
import com.munglog.backend.domain.schedule.dto.ScheduleResponse;
import com.munglog.backend.domain.schedule.dto.ScheduleStreakResponse;
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

/**
 * 반려동물 일정 컨트롤러.
 * 반려동물 일정 CRUD, 완료 토글, 케어 기록 전환, 스트릭 조회 기능을 제공하는 REST API 컨트롤러.
 * 기본 경로: /api/schedules
 */
@Tag(name = "일정", description = "반려동물 일정 관리 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    /**
     * [목적] 사용자 그룹의 일정 목록을 조회한다.
     * [설명] petId와 keyword 파라미터로 필터링할 수 있으며, 모두 생략 시 전체 목록을 반환한다.
     *
     * @param user    스프링 시큐리티 인증 객체
     * @param petId   특정 반려동물 UUID로 필터링 (선택)
     * @param keyword 제목·메모에 포함된 검색어 (선택)
     * @return 일정 응답 DTO 목록
     */
    @Operation(summary = "일정 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getSchedules(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getSchedules(uuid(user), petId, keyword)));
    }

    /**
     * [목적] 반복 일정의 스트릭(연속 완료 횟수) 정보를 조회한다.
     * [설명] 동일한 제목으로 2회 이상 등록된 일정을 묶어 연속 완료 횟수와 다음 예상 날짜를 반환한다.
     *        재고 연동된 일정의 경우 재고 소진 예상일도 함께 반환한다.
     *
     * @param user  스프링 시큐리티 인증 객체
     * @param petId 특정 반려동물 UUID로 필터링 (선택)
     * @return 스트릭 응답 DTO 목록
     */
    @Operation(summary = "반복 일정 스트릭 조회")
    @GetMapping("/streaks")
    public ResponseEntity<ApiResponse<List<ScheduleStreakResponse>>> getScheduleStreaks(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) UUID petId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getScheduleStreaks(uuid(user), petId)));
    }

    /**
     * [목적] 특정 일정의 상세 정보를 조회한다.
     * [설명] 그룹 소속 여부를 검증하여 타 그룹 일정에 접근하지 못하도록 한다.
     *
     * @param user       스프링 시큐리티 인증 객체
     * @param scheduleId 조회할 일정 UUID
     * @return 일정 응답 DTO
     */
    @Operation(summary = "일정 상세 조회")
    @GetMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> getSchedule(
            @AuthenticationPrincipal User user,
            @PathVariable UUID scheduleId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getSchedule(scheduleId, uuid(user))));
    }

    /**
     * [목적] 새 일정을 등록한다.
     * [설명] 반려동물·일정 유형·날짜·제목 등을 입력받아 일정을 저장한다.
     *        증상 태그, 재고 아이템, 예방접종 종류 연동도 함께 처리한다.
     *
     * @param user    스프링 시큐리티 인증 객체
     * @param request 일정 정보 DTO
     * @return 등록된 일정 응답 DTO
     */
    @Operation(summary = "일정 등록")
    @PostMapping
    public ResponseEntity<ApiResponse<ScheduleResponse>> createSchedule(
            @AuthenticationPrincipal User user,
            @RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.createSchedule(uuid(user), request)));
    }

    /**
     * [목적] 기존 일정을 수정한다.
     * [설명] 일정의 전체 필드를 요청 DTO로 덮어쓴다.
     *        증상 태그 목록이 변경된 경우 기존 태그를 삭제 후 재저장한다.
     *
     * @param user       스프링 시큐리티 인증 객체
     * @param scheduleId 수정할 일정 UUID
     * @param request    수정할 일정 정보 DTO
     * @return 수정된 일정 응답 DTO
     */
    @Operation(summary = "일정 수정")
    @PutMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> updateSchedule(
            @AuthenticationPrincipal User user,
            @PathVariable UUID scheduleId,
            @RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.updateSchedule(scheduleId, uuid(user), request)));
    }

    /**
     * [목적] 일정을 삭제한다.
     * [설명] 연관된 증상 스냅·증상 태그·첨부파일을 모두 함께 삭제한 뒤 일정을 제거한다.
     *
     * @param user       스프링 시큐리티 인증 객체
     * @param scheduleId 삭제할 일정 UUID
     * @return 빈 성공 응답
     */
    @Operation(summary = "일정 삭제")
    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(
            @AuthenticationPrincipal User user,
            @PathVariable UUID scheduleId) {
        scheduleService.deleteSchedule(scheduleId, uuid(user));
        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * [목적] 일정의 완료 상태를 토글한다.
     * [설명] 완료 → 미완료 또는 미완료 → 완료로 전환한다.
     *        재고 연동 일정의 경우 완료 시 재고를 1 차감, 취소 시 1 증가시킨다.
     *
     * @param user       스프링 시큐리티 인증 객체
     * @param scheduleId 토글할 일정 UUID
     * @return 상태가 변경된 일정 응답 DTO
     */
    @Operation(summary = "일정 완료 토글")
    @PatchMapping("/{scheduleId}/completion")
    public ResponseEntity<ApiResponse<ScheduleResponse>> toggleCompletion(
            @AuthenticationPrincipal User user,
            @PathVariable UUID scheduleId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.toggleCompletion(scheduleId, uuid(user))));
    }

    /**
     * [목적] 일정을 케어 기록으로 전환한다.
     * [설명] 일정 정보를 기반으로 CareRecord를 생성하고 일정을 완료 처리한다.
     *        이미 전환된 일정은 재전환이 불가하다.
     *
     * @param user       스프링 시큐리티 인증 객체
     * @param scheduleId 전환할 일정 UUID
     * @return 생성된 케어 기록의 UUID
     */
    @Operation(summary = "일정 → 케어 기록 전환")
    @PostMapping("/{scheduleId}/convert")
    public ResponseEntity<ApiResponse<UUID>> convertToCareRecord(
            @AuthenticationPrincipal User user,
            @PathVariable UUID scheduleId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.convertToCareRecord(scheduleId, uuid(user))));
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
