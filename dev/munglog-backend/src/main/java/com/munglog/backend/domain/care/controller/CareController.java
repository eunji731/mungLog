package com.munglog.backend.domain.care.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.care.dto.CareRecordCreateRequest;
import com.munglog.backend.domain.care.dto.CareRecordDetailResponse;
import com.munglog.backend.domain.care.dto.CareRecordListResponse;
import com.munglog.backend.domain.care.service.CareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "케어 기록", description = "반려동물 케어 기록 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/care")
public class CareController {

    private final CareService careService;

    @Operation(summary = "케어 기록 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CareRecordListResponse>>> getRecords(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.success(careService.getRecords(uuid(user), petId, keyword)));
    }

    @Operation(summary = "케어 기록 상세 조회")
    @GetMapping("/{recordId}")
    public ResponseEntity<ApiResponse<CareRecordDetailResponse>> getRecord(
            @AuthenticationPrincipal User user,
            @PathVariable UUID recordId) {
        return ResponseEntity.ok(ApiResponse.success(careService.getRecord(recordId, uuid(user))));
    }

    @Operation(summary = "병원 기록 후보 조회 (지출 연동용)")
    @GetMapping("/medical-candidates")
    public ResponseEntity<ApiResponse<List<CareRecordListResponse>>> getMedicalCandidates(
            @AuthenticationPrincipal User user,
            @RequestParam UUID petId) {
        return ResponseEntity.ok(ApiResponse.success(careService.getMedicalCandidates(uuid(user), petId)));
    }

    @Operation(summary = "케어 기록 등록")
    @PostMapping
    public ResponseEntity<ApiResponse<CareRecordDetailResponse>> createRecord(
            @AuthenticationPrincipal User user,
            @RequestBody CareRecordCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(careService.createRecord(uuid(user), request)));
    }

    @Operation(summary = "케어 기록 수정")
    @PutMapping("/{recordId}")
    public ResponseEntity<ApiResponse<CareRecordDetailResponse>> updateRecord(
            @AuthenticationPrincipal User user,
            @PathVariable UUID recordId,
            @RequestBody CareRecordCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(careService.updateRecord(recordId, uuid(user), request)));
    }

    @Operation(summary = "케어 기록 삭제")
    @DeleteMapping("/{recordId}")
    public ResponseEntity<ApiResponse<Void>> deleteRecord(
            @AuthenticationPrincipal User user,
            @PathVariable UUID recordId) {
        careService.deleteRecord(recordId, uuid(user));
        return ResponseEntity.ok(ApiResponse.success());
    }

    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
