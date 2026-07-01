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

/**
 * AI 일지 및 제품 분석 관련 HTTP 요청을 처리하는 컨트롤러.
 * 주요 기능: AI 사용량 조회, 이미지 메타데이터 확인, AI 일지 분석·저장, 제품 이미지 분석
 */
@Tag(name = "AI 일지", description = "AI 분석 및 일지 생성 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/ai")
public class AiDiaryController {

    private final AiDiaryService aiDiaryService;
    private final AiInventoryService aiInventoryService;

    /**
     * [목적] 특정 날짜의 AI 기능 사용량과 일일 전체 사용량을 조회한다.
     * [설명] 날짜별 분석 횟수와 일일 총 사용 횟수를 확인하여 사용 제한 여부를 알 수 있다.
     *
     * @param user       인증된 사용자 정보 (Spring Security)
     * @param targetDate 사용량을 조회할 기준 날짜 (ISO 형식: yyyy-MM-dd)
     * @return AI 사용량 정보 (날짜별/일별 사용 횟수, 제한 초과 여부)
     */
    @Operation(summary = "AI 사용량 조회")
    @GetMapping("/usage")
    public ResponseEntity<ApiResponse<AiUsageResponse>> getUsage(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate targetDate) {
        return ResponseEntity.ok(ApiResponse.success(
                aiDiaryService.getUsage(uuid(user), targetDate)));
    }

    /**
     * [목적] 업로드할 이미지 파일의 EXIF 메타데이터(촬영일시, GPS)를 사전 확인한다.
     * [설명] 실제 저장 전에 파일에 날짜·위치 정보가 포함되어 있는지 체크하여
     *        AI 분석 품질을 사전에 안내할 수 있다.
     *
     * @param files 메타데이터를 확인할 이미지 파일 목록
     * @return 파일별 날짜 포함 여부(hasDate)와 GPS 포함 여부(hasGps) 목록
     */
    @Operation(summary = "이미지 메타데이터 확인")
    @PostMapping(value = "/check-metadata", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<CheckMetadataResponse>>> checkMetadata(
            @RequestPart("files") List<MultipartFile> files) {
        return ResponseEntity.ok(ApiResponse.success(aiDiaryService.checkMetadata(files)));
    }

    /**
     * [목적] 업로드된 사진들을 Gemini AI로 분석하여 반려동물 1인칭 일지를 생성한다.
     * [설명] 이미지 EXIF 정보를 추출하고, 반려동물 정보·사용자 태그를 포함한 프롬프트를
     *        Gemini에 전송하여 AI 일지 결과와 저장된 파일 정보를 반환한다.
     *        날짜별·일별 사용 제한을 초과하면 예외를 던진다.
     *
     * @param user       인증된 사용자 정보
     * @param targetDate 일지 대상 날짜 (ISO 형식: yyyy-MM-dd)
     * @param files      분석할 이미지 파일 목록
     * @param petInfos   분석에 포함할 반려동물 ID·이름 목록 (선택)
     * @param userTags   일지에 반영할 사용자 키워드 목록 (선택)
     * @return AI가 생성한 일지 결과(aiResult)와 서버에 저장된 파일 정보(storedFiles)
     * @throws com.munglog.backend.common.exception.AiRateLimitException 사용량 제한 초과 시
     */
    @Operation(summary = "AI 일지 분석")
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AnalyzeDiaryResult>> analyze(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate targetDate,
            @RequestPart("files") List<MultipartFile> files,
            @RequestPart(value = "petInfos", required = false) List<PetInfoRequest> petInfos,
            @RequestPart(value = "userTags", required = false) List<String> userTags) {
        return ResponseEntity.ok(ApiResponse.success(
                aiDiaryService.analyze(uuid(user), targetDate, files, petInfos, userTags)));
    }

    /**
     * [목적] AI가 분석한 일지 결과를 Memory(추억) 엔티티로 영구 저장한다.
     * [설명] 분석 결과, 저장 파일 정보, 참여 반려동물 목록을 받아 Memory·MemoryMoment·Photo 등을
     *        데이터베이스에 저장한다. 기존 Memory(oldMemoryId)가 있으면 교체(삭제 후 재생성)한다.
     *
     * @param user    인증된 사용자 정보
     * @param request 저장할 일지 데이터 (날짜, AI 결과, 파일 정보, 반려동물 ID, 기존 Memory ID)
     * @return 새로 생성된 Memory의 UUID
     */
    @Operation(summary = "AI 일지 저장")
    @PostMapping("/save")
    public ResponseEntity<ApiResponse<UUID>> saveDiary(
            @AuthenticationPrincipal User user,
            @RequestBody SaveDiaryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(aiDiaryService.saveDiary(uuid(user), request)));
    }

    /**
     * [목적] 반려동물 용품 이미지에서 상품 정보를 AI로 추출한다.
     * [설명] 이미지를 Base64로 변환하여 Gemini에 OCR 및 정보 추출을 요청한다.
     *        카테고리, 제품명, 브랜드, 성분 등 인벤토리 등록에 필요한 정보를 반환한다.
     *        일일 사용 제한(INVENTORY 타입)을 초과하면 예외를 던진다.
     *
     * @param user   인증된 사용자 정보
     * @param images 분석할 제품 이미지 파일 목록
     * @return AI가 추출한 제품 정보 (카테고리, 이름, 브랜드, 성분, 보관방법 등)
     * @throws com.munglog.backend.common.exception.AiRateLimitException 일일 사용량 제한 초과 시
     */
    @Operation(summary = "제품 이미지 분석")
    @PostMapping(value = "/analyze-product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AnalyzeProductResult>> analyzeProduct(
            @AuthenticationPrincipal User user,
            @RequestPart("images") List<MultipartFile> images) {
        return ResponseEntity.ok(ApiResponse.success(aiInventoryService.analyzeProduct(uuid(user), images)));
    }

    /**
     * [목적] Spring Security User 객체에서 UUID 형태의 사용자 ID를 추출한다.
     * [설명] JWT 토큰에 저장된 userId(문자열)를 UUID 타입으로 변환하여 서비스 계층에 전달한다.
     *
     * @param user Spring Security가 주입한 인증 사용자 객체
     * @return UUID 형태의 사용자 ID
     */
    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
