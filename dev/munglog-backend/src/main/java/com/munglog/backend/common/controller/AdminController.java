package com.munglog.backend.common.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.category.dto.CategoryRequest;
import com.munglog.backend.domain.category.dto.CategoryResponse;
import com.munglog.backend.domain.category.service.CategoryService;
import com.munglog.backend.domain.memory.service.ThumbnailMigrationService;
import com.munglog.backend.domain.vaccination.dto.VaccinationTypeCreateRequest;
import com.munglog.backend.domain.vaccination.dto.VaccinationTypeResponse;
import com.munglog.backend.domain.vaccination.service.VaccinationAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ThumbnailMigrationService thumbnailMigrationService;
    private final CategoryService categoryService;
    private final VaccinationAdminService vaccinationAdminService;

    // ─── 케어기록 카테고리 관리 ─────────────────────────────────────
    @GetMapping("/care-categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCareCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCareCategories()));
    }

    @PostMapping("/care-categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCareCategory(@RequestBody CategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.createCareCategory(req)));
    }

    @PutMapping("/care-categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCareCategory(
            @PathVariable Long id, @RequestBody CategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.updateCareCategory(id, req)));
    }

    @DeleteMapping("/care-categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCareCategory(@PathVariable Long id) {
        categoryService.deleteCareCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ─── 일정 카테고리 관리 ────────────────────────────────────────
    @GetMapping("/schedule-categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getScheduleCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getScheduleCategories()));
    }

    @PostMapping("/schedule-categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createScheduleCategory(@RequestBody CategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.createScheduleCategory(req)));
    }

    @PutMapping("/schedule-categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateScheduleCategory(
            @PathVariable Long id, @RequestBody CategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.updateScheduleCategory(id, req)));
    }

    @DeleteMapping("/schedule-categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteScheduleCategory(@PathVariable Long id) {
        categoryService.deleteScheduleCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ─── 글로벌 접종종류 관리 (시스템 마스터) ──────────────────────
    @GetMapping("/vaccination-types")
    public ResponseEntity<ApiResponse<List<VaccinationTypeResponse>>> getGlobalVaccinationTypes() {
        return ResponseEntity.ok(ApiResponse.success(vaccinationAdminService.getGlobalTypes()));
    }

    @PostMapping("/vaccination-types")
    public ResponseEntity<ApiResponse<VaccinationTypeResponse>> createGlobalVaccinationType(
            @RequestBody VaccinationTypeCreateRequest req) {
        return ResponseEntity.ok(ApiResponse.success(vaccinationAdminService.createGlobalType(req)));
    }

    @PutMapping("/vaccination-types/{id}")
    public ResponseEntity<ApiResponse<VaccinationTypeResponse>> updateGlobalVaccinationType(
            @PathVariable Long id, @RequestBody VaccinationTypeCreateRequest req) {
        return ResponseEntity.ok(ApiResponse.success(vaccinationAdminService.updateGlobalType(id, req)));
    }

    @DeleteMapping("/vaccination-types/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivateGlobalVaccinationType(@PathVariable Long id) {
        vaccinationAdminService.deactivateGlobalType(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ─── 기타 유틸 ────────────────────────────────────────────────
    @PostMapping("/migrate-thumbnails")
    public ResponseEntity<ApiResponse<ThumbnailMigrationService.MigrationResult>> migrateThumbnails() {
        return ResponseEntity.ok(ApiResponse.success(thumbnailMigrationService.migrate()));
    }
}
