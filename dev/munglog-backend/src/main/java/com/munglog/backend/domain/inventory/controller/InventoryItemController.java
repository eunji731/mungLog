package com.munglog.backend.domain.inventory.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.inventory.dto.InventoryItemRequest;
import com.munglog.backend.domain.inventory.dto.InventoryItemResponse;
import com.munglog.backend.domain.inventory.service.InventoryItemService;
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
 * 반려동물 용품 관리 컨트롤러.
 * 용품 등록·조회·수정·삭제 및 급여 중 토글 API를 제공하는 REST 컨트롤러.
 * 주요 기능: 용품 CRUD, 급여 상태 토글
 */
@Tag(name = "용품 관리", description = "반려동물 용품 관리 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/inventory")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    /**
     * [목적] 새 용품을 등록한다.
     *
     * @param user    로그인 사용자
     * @param request 용품 정보 DTO
     * @param images  용품 이미지 목록 (없으면 null)
     * @return 등록된 용품 응답 DTO
     */
    @Operation(summary = "용품 등록")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<InventoryItemResponse>> createItem(
            @AuthenticationPrincipal User user,
            @RequestPart("data") InventoryItemRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.ok(ApiResponse.success(inventoryItemService.createItem(uuid(user), request, images)));
    }

    /**
     * [목적] 현재 사용자 그룹의 용품 목록을 조회한다.
     *
     * @param user 로그인 사용자
     * @return 용품 응답 DTO 목록
     */
    @Operation(summary = "용품 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryItemResponse>>> getItems(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(inventoryItemService.getItems(uuid(user))));
    }

    /**
     * [목적] 특정 용품의 상세 정보를 조회한다.
     *
     * @param user   로그인 사용자
     * @param itemId 조회할 용품 UUID
     * @return 용품 응답 DTO
     */
    @Operation(summary = "용품 상세 조회")
    @GetMapping("/{itemId}")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> getItem(
            @AuthenticationPrincipal User user,
            @PathVariable UUID itemId) {
        return ResponseEntity.ok(ApiResponse.success(inventoryItemService.getItem(itemId, uuid(user))));
    }

    /**
     * [목적] 특정 용품 정보를 수정한다.
     *
     * @param user    로그인 사용자
     * @param itemId  수정할 용품 UUID
     * @param request 수정할 용품 정보 DTO
     * @param images  새 이미지 목록 (없으면 null)
     * @return 수정된 용품 응답 DTO
     */
    @Operation(summary = "용품 수정")
    @PatchMapping(value = "/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<InventoryItemResponse>> updateItem(
            @AuthenticationPrincipal User user,
            @PathVariable UUID itemId,
            @RequestPart("data") InventoryItemRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.ok(ApiResponse.success(inventoryItemService.updateItem(itemId, uuid(user), request, images)));
    }

    /**
     * [목적] 특정 용품을 삭제한다.
     *
     * @param user   로그인 사용자
     * @param itemId 삭제할 용품 UUID
     * @return 빈 성공 응답
     */
    @Operation(summary = "용품 삭제")
    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @AuthenticationPrincipal User user,
            @PathVariable UUID itemId) {
        inventoryItemService.deleteItem(itemId, uuid(user));
        return ResponseEntity.ok(ApiResponse.success());
    }

    /**
     * [목적] 용품의 급여 중(isFeeding) 상태를 토글한다.
     *
     * @param user   로그인 사용자
     * @param itemId 토글할 용품 UUID
     * @return 변경된 용품 응답 DTO
     */
    @Operation(summary = "급여 중 토글")
    @PatchMapping("/{itemId}/feeding")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> toggleFeeding(
            @AuthenticationPrincipal User user,
            @PathVariable UUID itemId) {
        return ResponseEntity.ok(ApiResponse.success(inventoryItemService.toggleFeeding(itemId, uuid(user))));
    }

    /**
     * [목적] Spring Security User 객체에서 UUID를 추출한다.
     *
     * @param user Spring Security 인증 사용자 객체
     * @return 사용자 UUID
     */
    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
