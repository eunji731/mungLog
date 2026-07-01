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

/**
 * 예방접종 종류 컨트롤러.
 * 접종 종류 마스터 관리 API 엔드포인트를 제공하는 클래스.
 * 주요 기능: 활성 목록 조회, 추가/수정/비활성화, 병합, 별칭 검색/추가
 */
@Tag(name = "예방접종 종류", description = "접종종류 마스터 관리 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/vaccination-types")
public class VaccinationTypeController {

    private final VaccinationTypeService vaccinationTypeService;

    /**
     * [목적] 현재 사용자 그룹에서 사용 가능한 활성 접종 종류 목록을 조회한다.
     * [설명] 전역(글로벌) 접종 종류와 그룹 전용 접종 종류를 함께 반환한다.
     *
     * @param user 현재 로그인한 사용자
     * @return 활성 접종 종류 응답 DTO 목록
     */
    @Operation(summary = "활성 접종종류 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<VaccinationTypeResponse>>> getActiveTypes(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(vaccinationTypeService.getActiveTypes(uuid(user))));
    }

    /**
     * [목적] 그룹 전용 접종 종류를 새로 추가한다.
     *
     * @param user    현재 로그인한 사용자
     * @param request 접종 종류 생성 요청 DTO
     * @return 생성된 접종 종류 응답 DTO
     */
    @Operation(summary = "접종종류 추가")
    @PostMapping
    public ResponseEntity<ApiResponse<VaccinationTypeResponse>> createType(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody VaccinationTypeCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(vaccinationTypeService.createType(uuid(user), request)));
    }

    /**
     * [목적] 그룹이 생성한 접종 종류를 수정한다.
     * [설명] 전역(글로벌) 접종 종류는 수정할 수 없으며, 그룹 소유 항목만 수정 가능하다.
     *
     * @param user    현재 로그인한 사용자
     * @param typeId  수정할 접종 종류 ID
     * @param request 수정 요청 DTO
     * @return 수정된 접종 종류 응답 DTO
     */
    @Operation(summary = "접종종류 수정 (사용자 생성 항목만)")
    @PutMapping("/{typeId}")
    public ResponseEntity<ApiResponse<VaccinationTypeResponse>> updateType(
            @AuthenticationPrincipal User user,
            @PathVariable Long typeId,
            @Valid @RequestBody VaccinationTypeCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(vaccinationTypeService.updateType(uuid(user), typeId, request)));
    }

    /**
     * [목적] 접종 종류를 비활성화(소프트 삭제)한다.
     * [설명] 데이터 보존을 위해 실제 삭제 대신 비활성화 처리한다.
     *
     * @param user   현재 로그인한 사용자
     * @param typeId 비활성화할 접종 종류 ID
     */
    @Operation(summary = "접종종류 비활성화 (삭제 대신)")
    @PutMapping("/{typeId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateType(
            @AuthenticationPrincipal User user,
            @PathVariable Long typeId) {
        vaccinationTypeService.deactivateType(uuid(user), typeId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * [목적] 두 접종 종류를 병합한다.
     * [설명] 소스 접종 종류를 대상 접종 종류로 합치고 소스를 비활성화한다.
     *
     * @param user    현재 로그인한 사용자
     * @param request 병합 요청 DTO (sourceId, targetId)
     */
    @Operation(summary = "접종종류 병합")
    @PostMapping("/merge")
    public ResponseEntity<ApiResponse<Void>> mergeTypes(
            @AuthenticationPrincipal User user,
            @RequestBody VaccinationMergeRequest request) {
        vaccinationTypeService.mergeTypes(uuid(user), request);
        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * [목적] 별칭으로 접종 종류를 검색한다.
     * [설명] 정확히 일치하는 별칭을 먼저 찾고, 없으면 포함 검색 결과를 반환한다.
     *
     * @param q 검색 쿼리 (별칭 키워드)
     * @return 매칭된 접종 종류 별칭 응답 DTO 목록
     */
    @Operation(summary = "별칭으로 접종종류 ��색")
    @GetMapping("/aliases/match")
    public ResponseEntity<ApiResponse<List<VaccinationAliasMatchResponse>>> matchAlias(
            @RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(vaccinationTypeService.matchAlias(q)));
    }

    /**
     * [목적] 접종 종류에 새 별칭을 추가한다.
     *
     * @param user   현재 로그인한 사용자
     * @param typeId 별칭을 추가할 접종 종류 ID
     * @param alias  추가할 별칭 문자열
     */
    @Operation(summary = "별칭 추가")
    @PostMapping("/{typeId}/aliases")
    public ResponseEntity<ApiResponse<Void>> addAlias(
            @AuthenticationPrincipal User user,
            @PathVariable Long typeId,
            @RequestParam String alias) {
        vaccinationTypeService.addAlias(uuid(user), typeId, alias);
        return ResponseEntity.ok(ApiResponse.success());
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
