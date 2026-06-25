package com.munglog.backend.domain.symptomsnap.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.symptomsnap.dto.SymptomSnapLinkRequest;
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

@Tag(name = "증상 스냅보드", description = "반려동물 증상 스냅 기록 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/symptom-snaps")
public class SymptomSnapController {

    private final SymptomSnapService symptomSnapService;

    @Operation(summary = "증상 스냅 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<SymptomSnapResponse>>> getSnaps(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(symptomSnapService.getSnaps(uuid(user), petId, startDate, endDate)));
    }

    @Operation(summary = "증상 스냅 등록")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<SymptomSnapResponse>> createSnap(
            @AuthenticationPrincipal User user,
            @RequestPart("data") SymptomSnapRequest request,
            @RequestPart(value = "symptomImage", required = false) MultipartFile symptomImage) {
        return ResponseEntity.ok(ApiResponse.success(symptomSnapService.createSnap(uuid(user), request, symptomImage)));
    }

    @Operation(summary = "증상 스냅 수정")
    @PutMapping(value = "/{snapId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<SymptomSnapResponse>> updateSnap(
            @AuthenticationPrincipal User user,
            @PathVariable UUID snapId,
            @RequestPart("data") SymptomSnapRequest request,
            @RequestPart(value = "symptomImage", required = false) MultipartFile symptomImage) {
        return ResponseEntity.ok(ApiResponse.success(symptomSnapService.updateSnap(snapId, uuid(user), request, symptomImage)));
    }

    @Operation(summary = "증상 스냅 삭제")
    @DeleteMapping("/{snapId}")
    public ResponseEntity<ApiResponse<Void>> deleteSnap(
            @AuthenticationPrincipal User user,
            @PathVariable UUID snapId) {
        symptomSnapService.deleteSnap(snapId, uuid(user));
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "진료 기록 연동")
    @PatchMapping("/{snapId}/link")
    public ResponseEntity<ApiResponse<SymptomSnapResponse>> linkRecord(
            @AuthenticationPrincipal User user,
            @PathVariable UUID snapId,
            @RequestBody SymptomSnapLinkRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                symptomSnapService.linkRecord(snapId, uuid(user), request.getResolvedRecordId())));
    }

    @Operation(summary = "진료 기록 연동 해제")
    @PatchMapping("/{snapId}/unlink")
    public ResponseEntity<ApiResponse<SymptomSnapResponse>> unlinkRecord(
            @AuthenticationPrincipal User user,
            @PathVariable UUID snapId) {
        return ResponseEntity.ok(ApiResponse.success(symptomSnapService.unlinkRecord(snapId, uuid(user))));
    }

    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
