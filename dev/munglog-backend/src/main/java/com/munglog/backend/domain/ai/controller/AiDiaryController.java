package com.munglog.backend.domain.ai.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.ai.dto.*;
import com.munglog.backend.domain.ai.service.AiDiaryService;
import com.munglog.backend.domain.ai.service.AiInventoryService;
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

@Tag(name = "AI 일지", description = "AI 분석 및 일지 생성 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/ai")
public class AiDiaryController {

    private final AiDiaryService aiDiaryService;
    private final AiInventoryService aiInventoryService;

    @Operation(summary = "AI 사용량 조회")
    @GetMapping("/usage")
    public ResponseEntity<ApiResponse<AiUsageResponse>> getUsage(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate targetDate) {
        return ResponseEntity.ok(ApiResponse.success(
                aiDiaryService.getUsage(uuid(user), targetDate)));
    }

    @Operation(summary = "이미지 메타데이터 확인")
    @PostMapping(value = "/check-metadata", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<CheckMetadataResponse>>> checkMetadata(
            @RequestPart("files") List<MultipartFile> files) {
        return ResponseEntity.ok(ApiResponse.success(aiDiaryService.checkMetadata(files)));
    }

    @Operation(summary = "AI 일지 분석")
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AnalyzeDiaryResult>> analyze(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate targetDate,
            @RequestPart("files") List<MultipartFile> files,
            @RequestPart(value = "petInfos", required = false) List<PetInfoRequest> petInfos) {
        return ResponseEntity.ok(ApiResponse.success(
                aiDiaryService.analyze(uuid(user), targetDate, files, petInfos)));
    }

    @Operation(summary = "AI 일지 저장")
    @PostMapping("/save")
    public ResponseEntity<ApiResponse<UUID>> saveDiary(
            @AuthenticationPrincipal User user,
            @RequestBody SaveDiaryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(aiDiaryService.saveDiary(uuid(user), request)));
    }

    @Operation(summary = "제품 이미지 분석")
    @PostMapping(value = "/analyze-product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AnalyzeProductResult>> analyzeProduct(
            @AuthenticationPrincipal User user,
            @RequestPart("files") List<MultipartFile> files) {
        return ResponseEntity.ok(ApiResponse.success(aiInventoryService.analyzeProduct(uuid(user), files)));
    }

    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
