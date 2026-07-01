package com.munglog.backend.domain.symptomsnap.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.symptomsnap.dto.SymptomSnapLinkRequest;
import com.munglog.backend.domain.symptomsnap.dto.SymptomSnapLinkScheduleRequest;
import com.munglog.backend.domain.symptomsnap.dto.SymptomSnapRequest;
import com.munglog.backend.domain.symptomsnap.dto.SymptomSnapResponse;
import com.munglog.backend.domain.symptomsnap.service.SymptomSnapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 증상 스냅 컨트롤러.
 * 반려동물의 증상 스냅 기록 CRUD 및 진료 기록·일정 연동 API 엔드포인트를 제공하는 클래스.
 * 주요 기능: 목록 조회, 등록/수정/삭제, 진료 기록 연동/해제, 일정 연동/해제
 */
@Tag(name = "증상 스냅보드", description = "반려동물 증상 스냅 기록 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/symptom-snaps")
public class SymptomSnapController {

    private final SymptomSnapService symptomSnapService;

    /**
     * [목적] 증상 스냅 목록을 필터 조건으로 조회한다.
     *
     * @param user      현재 로그인한 사용자
     * @param petId     특정 반려동물 필터 (선택)
     * @param startDate 조회 시작일 (선택)
     * @param endDate   조회 종료일 (선택)
     * @return 필터된 증상 스냅 응답 DTO 목록
     */
    @Operation(summary = "증상 스냅 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<SymptomSnapResponse>>> getSnaps(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(symptomSnapService.getSnaps(uuid(user), petId, startDate, endDate)));
    }

    /**
     * [목적] 새 증상 스냅을 등록한다.
     *
     * @param user         현재 로그인한 사용자
     * @param request      증상 스냅 요청 DTO
     * @param symptomImage 증상 사진 파일 (선택)
     * @return 등록된 증상 스냅 응답 DTO
     */
    @Operation(summary = "증상 스냅 등록")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<SymptomSnapResponse>> createSnap(
            @AuthenticationPrincipal User user,
            @RequestPart("data") SymptomSnapRequest request,
            @RequestPart(value = "symptomImage", required = false) MultipartFile symptomImage) {
        return ResponseEntity.ok(ApiResponse.success(symptomSnapService.createSnap(uuid(user), request, symptomImage)));
    }

    /**
     * [목적] 기존 증상 스냅을 수정한다.
     *
     * @param user         현재 로그인한 사용자
     * @param snapId       수정할 증상 스냅 UUID
     * @param request      수정 요청 DTO
     * @param symptomImage 새 증상 사진 파일 (선택)
     * @return 수정된 증상 스냅 응답 DTO
     */
    @Operation(summary = "증상 스냅 수정")
    @PutMapping(value = "/{snapId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<SymptomSnapResponse>> updateSnap(
            @AuthenticationPrincipal User user,
            @PathVariable UUID snapId,
            @RequestPart("data") SymptomSnapRequest request,
            @RequestPart(value = "symptomImage", required = false) MultipartFile symptomImage) {
        return ResponseEntity.ok(ApiResponse.success(symptomSnapService.updateSnap(snapId, uuid(user), request, symptomImage)));
    }

    /**
     * [목적] 증상 스냅을 삭제한다.
     *
     * @param user   현재 로그인한 사용자
     * @param snapId 삭제할 증상 스냅 UUID
     */
    @Operation(summary = "증상 스냅 삭제")
    @DeleteMapping("/{snapId}")
    public ResponseEntity<ApiResponse<Void>> deleteSnap(
            @AuthenticationPrincipal User user,
            @PathVariable UUID snapId) {
        symptomSnapService.deleteSnap(snapId, uuid(user));
        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * [목적] 증상 스냅을 진료 기록과 연동한다.
     * [설명] 증상 관찰 후 진료를 받은 경우 해당 진료 기록과 연결하여 RESOLVED 상태로 변경한다.
     *
     * @param user    현재 로그인한 사용자
     * @param snapId  연동할 증상 스냅 UUID
     * @param request 연동할 진료 기록 ID를 담은 요청 DTO
     * @return 업데이트된 증상 스냅 응답 DTO
     */
    @Operation(summary = "진료 기록 연동")
    @PatchMapping("/{snapId}/link")
    public ResponseEntity<ApiResponse<SymptomSnapResponse>> linkRecord(
            @AuthenticationPrincipal User user,
            @PathVariable UUID snapId,
            @RequestBody SymptomSnapLinkRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                symptomSnapService.linkRecord(snapId, uuid(user), request.getResolvedRecordId())));
    }

    /**
     * [목적] 증상 스냅의 진료 기록 연동을 해제한다.
     * [설명] 연동 해제 시 상태가 MONITORING으로 되돌아간다.
     *
     * @param user   현재 로그인한 사용자
     * @param snapId 연동 해제할 증상 스냅 UUID
     * @return 업데이트된 증상 스냅 응답 DTO
     */
    @Operation(summary = "진료 기록 연동 해제")
    @PatchMapping("/{snapId}/unlink")
    public ResponseEntity<ApiResponse<SymptomSnapResponse>> unlinkRecord(
            @AuthenticationPrincipal User user,
            @PathVariable UUID snapId) {
        return ResponseEntity.ok(ApiResponse.success(symptomSnapService.unlinkRecord(snapId, uuid(user))));
    }

    /**
     * [목적] 증상 스냅을 일정과 연동한다.
     *
     * @param user    현재 로그인한 사용자
     * @param snapId  연동할 증상 스냅 UUID
     * @param request 연동할 일정 ID를 담은 요청 DTO
     * @return 업데이트된 증상 스냅 응답 DTO
     */
    @Operation(summary = "일정 연동")
    @PatchMapping("/{snapId}/link-schedule")
    public ResponseEntity<ApiResponse<SymptomSnapResponse>> linkSchedule(
            @AuthenticationPrincipal User user,
            @PathVariable UUID snapId,
            @RequestBody SymptomSnapLinkScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                symptomSnapService.linkSchedule(snapId, uuid(user), request.getLinkedScheduleId())));
    }

    /**
     * [목적] 증상 스냅의 일정 연동을 해제한다.
     *
     * @param user   현재 로그인한 사용자
     * @param snapId 일정 연동을 해제할 증상 스냅 UUID
     * @return 업데이트된 증상 스냅 응답 DTO
     */
    @Operation(summary = "일정 연동 해제")
    @PatchMapping("/{snapId}/unlink-schedule")
    public ResponseEntity<ApiResponse<SymptomSnapResponse>> unlinkSchedule(
            @AuthenticationPrincipal User user,
            @PathVariable UUID snapId) {
        return ResponseEntity.ok(ApiResponse.success(symptomSnapService.unlinkSchedule(snapId, uuid(user))));
    }

    /**
     * [목적] Spring Security User 객체에서 사용자 UUID를 추출한다.
     *
     * @param user 인증된 사용자 객체
     * @return 사용자 UUID
     */
    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
