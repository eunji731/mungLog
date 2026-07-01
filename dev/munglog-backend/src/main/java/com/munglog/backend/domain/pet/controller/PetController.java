package com.munglog.backend.domain.pet.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.pet.dto.PetRequest;
import com.munglog.backend.domain.pet.dto.PetResponse;
import com.munglog.backend.domain.pet.service.PetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * 반려동물 컨트롤러.
 * 반려동물 등록·조회·수정·삭제 기능을 제공하는 REST API 컨트롤러.
 * 프로필 이미지 업로드를 지원하므로 multipart/form-data 형식을 사용한다.
 * 기본 경로: /api/pets
 */
@Tag(name = "반려동물", description = "반려동물 CRUD API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;

    /**
     * [목적] 현재 사용자 그룹의 활성 반려동물 목록을 조회한다.
     * [설명] 로그인한 사용자가 속한 가족 그룹의 isActive=true인 반려동물 전체를 반환한다.
     *
     * @param user 스프링 시큐리티 인증 객체
     * @return 반려동물 응답 DTO 목록
     */
    @Operation(summary = "반려동물 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PetResponse>>> getPets(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(petService.getPets(uuid(user))));
    }

    /**
     * [목적] 새 반려동물을 등록한다.
     * [설명] 사용자 그룹에 새 반려동물을 추가하며, 프로필 이미지가 있으면 함께 저장한다.
     *        요청 본문(data)과 이미지 파일(profileImage)을 multipart로 전송한다.
     *
     * @param user         스프링 시큐리티 인증 객체
     * @param request      반려동물 정보 DTO
     * @param profileImage 프로필 이미지 파일 (선택)
     * @return 등록된 반려동물 응답 DTO
     */
    @Operation(summary = "반려동물 등록")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PetResponse>> createPet(
            @AuthenticationPrincipal User user,
            @RequestPart("data") PetRequest request,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        return ResponseEntity.ok(ApiResponse.success(petService.createPet(uuid(user), request, profileImage)));
    }

    /**
     * [목적] 반려동물 정보를 수정한다.
     * [설명] 경로의 petId에 해당하는 반려동물 정보를 요청 DTO로 전체 덮어쓴다.
     *        새 프로필 이미지가 있으면 기존 이미지를 대체한다.
     *
     * @param user         스프링 시큐리티 인증 객체
     * @param petId        수정할 반려동물 UUID
     * @param request      수정할 반려동물 정보 DTO
     * @param profileImage 새 프로필 이미지 파일 (선택)
     * @return 수정된 반려동물 응답 DTO
     */
    @Operation(summary = "반려동물 수정")
    @PutMapping(value = "/{petId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PetResponse>> updatePet(
            @AuthenticationPrincipal User user,
            @PathVariable UUID petId,
            @RequestPart("data") PetRequest request,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        return ResponseEntity.ok(ApiResponse.success(petService.updatePet(petId, uuid(user), request, profileImage)));
    }

    /**
     * [목적] 반려동물을 소프트 삭제(비활성화)한다.
     * [설명] isActive=false로 변경하여 목록에서 숨기며, DB에서 실제 데이터는 유지된다.
     *
     * @param user  스프링 시큐리티 인증 객체
     * @param petId 삭제할 반려동물 UUID
     * @return 빈 성공 응답
     */
    @Operation(summary = "반려동물 삭제")
    @DeleteMapping("/{petId}")
    public ResponseEntity<ApiResponse<Void>> deletePet(
            @AuthenticationPrincipal User user,
            @PathVariable UUID petId) {
        petService.deletePet(petId, uuid(user));
        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * [목적] 인증 객체에서 사용자 UUID를 추출한다.
     *
     * @param user 스프링 시큐리티 User 객체 (username = UUID 문자열)
     * @return 변환된 UUID
     */
    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
