package com.munglog.backend.common.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.category.dto.CategoryRequest;
import com.munglog.backend.domain.category.dto.CategoryResponse;
import com.munglog.backend.domain.category.service.CategoryService;
import com.munglog.backend.domain.memory.service.ThumbnailMigrationService;
import com.munglog.backend.domain.symptom.dto.SymptomResponse;
import com.munglog.backend.domain.symptom.service.SymptomService;
import com.munglog.backend.domain.vaccination.dto.VaccinationMergeRequest;
import com.munglog.backend.domain.vaccination.dto.VaccinationTypeCreateRequest;
import com.munglog.backend.domain.vaccination.dto.VaccinationTypeResponse;
import com.munglog.backend.domain.vaccination.service.VaccinationAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자 전용 REST 컨트롤러.
 * SecurityConfig에서 /api/admin/** 경로는 ROLE_ADMIN 권한만 접근 가능하도록 설정되어 있다.
 * 주요 기능: 케어기록 카테고리, 일정 카테고리, 예방접종 종류, 증상 마스터 관리
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ThumbnailMigrationService thumbnailMigrationService;
    private final CategoryService categoryService;
    private final VaccinationAdminService vaccinationAdminService;
    private final SymptomService symptomService;

    // ─── 케어기록 카테고리 관리 ─────────────────────────────────────

    /**
     * [목적] 모든 케어기록 카테고리 목록을 조회한다.
     */
    @GetMapping("/care-categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCareCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCareCategories()));
    }

    /**
     * [목적] 새 케어기록 카테고리를 생성한다.
     *
     * @param req 생성할 카테고리 정보 (이름 등)
     */
    @PostMapping("/care-categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCareCategory(@RequestBody CategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.createCareCategory(req)));
    }

    /**
     * [목적] 기존 케어기록 카테고리 정보를 수정한다.
     *
     * @param id  수정할 카테고리 ID
     * @param req 수정할 카테고리 정보
     */
    @PutMapping("/care-categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCareCategory(
            @PathVariable Long id, @RequestBody CategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.updateCareCategory(id, req)));
    }

    /**
     * [목적] 케어기록 카테고리를 삭제한다.
     *
     * @param id 삭제할 카테고리 ID
     */
    @DeleteMapping("/care-categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCareCategory(@PathVariable Long id) {
        categoryService.deleteCareCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ─── 일정 카테고리 관리 ────────────────────────────────────────

    /**
     * [목적] 모든 일정 카테고리 목록을 조회한다.
     */
    @GetMapping("/schedule-categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getScheduleCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getScheduleCategories()));
    }

    /**
     * [목적] 새 일정 카테고리를 생성한다.
     *
     * @param req 생성할 카테고리 정보
     */
    @PostMapping("/schedule-categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createScheduleCategory(@RequestBody CategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.createScheduleCategory(req)));
    }

    /**
     * [목적] 기존 일정 카테고리 정보를 수정한다.
     *
     * @param id  수정할 카테고리 ID
     * @param req 수정할 카테고리 정보
     */
    @PutMapping("/schedule-categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateScheduleCategory(
            @PathVariable Long id, @RequestBody CategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.updateScheduleCategory(id, req)));
    }

    /**
     * [목적] 일정 카테고리를 삭제한다.
     *
     * @param id 삭제할 카테고리 ID
     */
    @DeleteMapping("/schedule-categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteScheduleCategory(@PathVariable Long id) {
        categoryService.deleteScheduleCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ─── 글로벌 접종종류 관리 (시스템 마스터) ──────────────────────

    /**
     * [목적] 시스템 전체 예방접종 종류 목록을 조회한다.
     */
    @GetMapping("/vaccination-types")
    public ResponseEntity<ApiResponse<List<VaccinationTypeResponse>>> getGlobalVaccinationTypes() {
        return ResponseEntity.ok(ApiResponse.success(vaccinationAdminService.getGlobalTypes()));
    }

    /**
     * [목적] 새 글로벌 예방접종 종류를 생성한다.
     *
     * @param req 생성할 예방접종 종류 정보
     */
    @PostMapping("/vaccination-types")
    public ResponseEntity<ApiResponse<VaccinationTypeResponse>> createGlobalVaccinationType(
            @RequestBody VaccinationTypeCreateRequest req) {
        return ResponseEntity.ok(ApiResponse.success(vaccinationAdminService.createGlobalType(req)));
    }

    /**
     * [목적] 기존 글로벌 예방접종 종류를 수정한다.
     *
     * @param id  수정할 예방접종 종류 ID
     * @param req 수정 내용
     */
    @PutMapping("/vaccination-types/{id}")
    public ResponseEntity<ApiResponse<VaccinationTypeResponse>> updateGlobalVaccinationType(
            @PathVariable Long id, @RequestBody VaccinationTypeCreateRequest req) {
        return ResponseEntity.ok(ApiResponse.success(vaccinationAdminService.updateGlobalType(id, req)));
    }

    /**
     * [목적] 글로벌 예방접종 종류를 비활성화(소프트 삭제)한다.
     *
     * @param id 비활성화할 예방접종 종류 ID
     */
    @DeleteMapping("/vaccination-types/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivateGlobalVaccinationType(@PathVariable Long id) {
        vaccinationAdminService.deactivateGlobalType(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * [목적] 사용자가 직접 생성한 예방접종 종류 목록을 조회한다.
     */
    @GetMapping("/vaccination-types/user-types")
    public ResponseEntity<ApiResponse<List<VaccinationTypeResponse>>> getUserCreatedVaccinationTypes() {
        return ResponseEntity.ok(ApiResponse.success(vaccinationAdminService.getUserCreatedTypes()));
    }

    /**
     * [목적] 사용자 정의 예방접종 종류를 글로벌 종류로 병합한다.
     * [설명] 동일한 접종명을 사용자가 중복 생성한 경우 관리자가 하나로 통합할 때 사용한다.
     *
     * @param req 병합 원본(sourceId)과 대상(targetId) ID
     */
    @PostMapping("/vaccination-types/merge")
    public ResponseEntity<ApiResponse<Void>> mergeVaccinationTypes(@RequestBody VaccinationMergeRequest req) {
        vaccinationAdminService.mergeUserTypeToGlobal(req.getSourceId(), req.getTargetId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ─── 증상마스터 관리 ──────────────────────────────────────────

    /**
     * [목적] 시스템 전체 증상 마스터 목록을 조회한다.
     */
    @GetMapping("/symptoms")
    public ResponseEntity<ApiResponse<List<SymptomResponse>>> getAllSymptoms() {
        return ResponseEntity.ok(ApiResponse.success(symptomService.getAllSymptoms()));
    }

    /**
     * [목적] 새 증상 마스터 항목을 생성한다.
     *
     * @param body name 키를 포함한 요청 Map (예: {"name": "구토"})
     */
    @PostMapping("/symptoms")
    public ResponseEntity<ApiResponse<SymptomResponse>> createSymptom(@RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(symptomService.createSymptom(body.get("name"))));
    }

    /**
     * [목적] 기존 증상 마스터 이름을 수정한다.
     *
     * @param id   수정할 증상 ID
     * @param body name 키를 포함한 요청 Map
     */
    @PutMapping("/symptoms/{id}")
    public ResponseEntity<ApiResponse<SymptomResponse>> updateSymptom(
            @PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(symptomService.updateSymptom(id, body.get("name"))));
    }

    /**
     * [목적] 증상 마스터를 비활성화한다 (소프트 삭제).
     *
     * @param id 비활성화할 증상 ID
     */
    @PutMapping("/symptoms/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateSymptom(@PathVariable Long id) {
        symptomService.deactivateSymptom(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * [목적] 비활성화된 증상 마스터를 다시 활성화한다.
     *
     * @param id 활성화할 증상 ID
     */
    @PutMapping("/symptoms/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activateSymptom(@PathVariable Long id) {
        symptomService.activateSymptom(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * [목적] 두 증상 마스터를 하나로 병합한다.
     * [설명] 중복 증상을 관리자가 통합할 때 사용한다.
     *        sourceId의 데이터가 targetId로 이전되고 source는 삭제된다.
     *
     * @param body sourceId, targetId를 포함한 요청 Map
     */
    @PostMapping("/symptoms/merge")
    public ResponseEntity<ApiResponse<Void>> mergeSymptoms(@RequestBody java.util.Map<String, Long> body) {
        symptomService.mergeSymptoms(body.get("sourceId"), body.get("targetId"));
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ─── 기타 유틸 ────────────────────────────────────────────────

    /**
     * [목적] 기존 메모리 사진의 썸네일을 일괄 생성한다.
     * [설명] 썸네일 기능 도입 이전 데이터를 마이그레이션할 때 사용하는 1회성 관리 API다.
     */
    @PostMapping("/migrate-thumbnails")
    public ResponseEntity<ApiResponse<ThumbnailMigrationService.MigrationResult>> migrateThumbnails() {
        return ResponseEntity.ok(ApiResponse.success(thumbnailMigrationService.migrate()));
    }
}
