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

/**
 * 케어 기록 컨트롤러.
 * 반려동물 병원 방문, 투약, 미용, 예방접종, 건강검진, 지출 등 케어 기록 CRUD API를 제공한다.
 * 주요 기능: 목록/상세 조회, 등록, 수정, 삭제, 지출 연동용 병원 기록 후보 조회
 */
@Tag(name = "케어 기록", description = "반려동물 케어 기록 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/care")
public class CareController {

    private final CareService careService;

    /**
     * [목적] 케어 기록 목록을 조회한다.
     * [설명] petId와 keyword를 조합하여 필터링할 수 있으며, 둘 다 없으면 전체 목록을 반환한다.
     *
     * @param user    현재 로그인한 사용자
     * @param petId   반려동물 UUID 필터 (선택)
     * @param keyword 제목·메모 검색 키워드 (선택)
     * @return 케어 기록 목록 응답 DTO 리스트
     */
    @Operation(summary = "케어 기록 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CareRecordListResponse>>> getRecords(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.success(careService.getRecords(uuid(user), petId, keyword)));
    }

    /**
     * [목적] 케어 기록 상세 정보를 조회한다.
     * [설명] 진료 상세, 지출 상세, 증상 태그, 첨부파일 목록을 모두 포함하여 반환한다.
     *
     * @param user     현재 로그인한 사용자
     * @param recordId 조회할 케어 기록 UUID
     * @return 케어 기록 상세 응답 DTO
     */
    @Operation(summary = "케어 기록 상세 조회")
    @GetMapping("/{recordId}")
    public ResponseEntity<ApiResponse<CareRecordDetailResponse>> getRecord(
            @AuthenticationPrincipal User user,
            @PathVariable UUID recordId) {
        return ResponseEntity.ok(ApiResponse.success(careService.getRecord(recordId, uuid(user))));
    }

    /**
     * [목적] 지출 기록에 연동할 병원 기록 후보 목록을 조회한다.
     * [설명] 특정 반려동물의 최근 1년 이내 HOSPITAL 타입 기록만 반환한다.
     *
     * @param user  현재 로그인한 사용자
     * @param petId 반려동물 UUID
     * @return 병원 기록 목록 응답 DTO 리스트
     */
    @Operation(summary = "병원 기록 후보 조회 (지출 연동용)")
    @GetMapping("/medical-candidates")
    public ResponseEntity<ApiResponse<List<CareRecordListResponse>>> getMedicalCandidates(
            @AuthenticationPrincipal User user,
            @RequestParam UUID petId) {
        return ResponseEntity.ok(ApiResponse.success(careService.getMedicalCandidates(uuid(user), petId)));
    }

    /**
     * [목적] 새 케어 기록을 등록한다.
     * [설명] 케어 유형에 따라 진료 상세(MedicalDetail) 또는 지출 상세(ExpenseDetail)를 함께 저장한다.
     *        증상 태그가 있으면 SymptomService를 통해 동기화한다.
     *
     * @param user    현재 로그인한 사용자
     * @param request 케어 기록 등록 요청 DTO
     * @return 등록된 케어 기록 상세 응답 DTO
     */
    @Operation(summary = "케어 기록 등록")
    @PostMapping
    public ResponseEntity<ApiResponse<CareRecordDetailResponse>> createRecord(
            @AuthenticationPrincipal User user,
            @RequestBody CareRecordCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(careService.createRecord(uuid(user), request)));
    }

    /**
     * [목적] 케어 기록을 수정한다.
     * [설명] 기본 정보, 진료 상세, 지출 상세, 증상 태그를 모두 업데이트한다.
     *
     * @param user     현재 로그인한 사용자
     * @param recordId 수정할 케어 기록 UUID
     * @param request  수정 요청 DTO
     * @return 수정된 케어 기록 상세 응답 DTO
     */
    @Operation(summary = "케어 기록 수정")
    @PutMapping("/{recordId}")
    public ResponseEntity<ApiResponse<CareRecordDetailResponse>> updateRecord(
            @AuthenticationPrincipal User user,
            @PathVariable UUID recordId,
            @RequestBody CareRecordCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(careService.updateRecord(recordId, uuid(user), request)));
    }

    /**
     * [목적] 케어 기록을 삭제한다.
     * [설명] 연결된 증상 스냅, 증상 태그, 첨부파일을 모두 먼저 삭제한 후 케어 기록을 제거한다.
     *
     * @param user     현재 로그인한 사용자
     * @param recordId 삭제할 케어 기록 UUID
     * @return 성공 응답 (빈 데이터)
     */
    @Operation(summary = "케어 기록 삭제")
    @DeleteMapping("/{recordId}")
    public ResponseEntity<ApiResponse<Void>> deleteRecord(
            @AuthenticationPrincipal User user,
            @PathVariable UUID recordId) {
        careService.deleteRecord(recordId, uuid(user));
        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * [목적] Spring Security User 객체에서 사용자 UUID를 추출한다.
     *
     * @param user Spring Security 인증 객체
     * @return 사용자 UUID
     */
    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
