package com.munglog.backend.domain.vaccination.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.vaccination.dto.*;
import com.munglog.backend.domain.vaccination.service.VaccinationTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "예방접종 종류", description = "접종종류 마스터 관리 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/vaccination-types")
public class VaccinationTypeController {

    private final VaccinationTypeService vaccinationTypeService;

    @Operation(summary = "활성 접종종류 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<VaccinationTypeResponse>>> getActiveTypes(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(vaccinationTypeService.getActiveTypes(uuid(user))));
    }

    @Operation(summary = "접종종류 추가")
    @PostMapping
    public ResponseEntity<ApiResponse<VaccinationTypeResponse>> createType(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody VaccinationTypeCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(vaccinationTypeService.createType(uuid(user), request)));
    }

    @Operation(summary = "접종종류 수정 (사용자 생성 항목만)")
    @PutMapping("/{typeId}")
    public ResponseEntity<ApiResponse<VaccinationTypeResponse>> updateType(
            @AuthenticationPrincipal User user,
            @PathVariable Long typeId,
            @Valid @RequestBody VaccinationTypeCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(vaccinationTypeService.updateType(uuid(user), typeId, request)));
    }

    @Operation(summary = "접종종류 비활성화 (삭제 대신)")
    @PutMapping("/{typeId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateType(
            @AuthenticationPrincipal User user,
            @PathVariable Long typeId) {
        vaccinationTypeService.deactivateType(uuid(user), typeId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "접종종류 병합")
    @PostMapping("/merge")
    public ResponseEntity<ApiResponse<Void>> mergeTypes(
            @AuthenticationPrincipal User user,
            @RequestBody VaccinationMergeRequest request) {
        vaccinationTypeService.mergeTypes(uuid(user), request);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "별칭으로 접종종류 검색")
    @GetMapping("/aliases/match")
    public ResponseEntity<ApiResponse<List<VaccinationAliasMatchResponse>>> matchAlias(
            @RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(vaccinationTypeService.matchAlias(q)));
    }

    @Operation(summary = "별칭 추가")
    @PostMapping("/{typeId}/aliases")
    public ResponseEntity<ApiResponse<Void>> addAlias(
            @AuthenticationPrincipal User user,
            @PathVariable Long typeId,
            @RequestParam String alias) {
        vaccinationTypeService.addAlias(uuid(user), typeId, alias);
        return ResponseEntity.ok(ApiResponse.success());
    }

    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
