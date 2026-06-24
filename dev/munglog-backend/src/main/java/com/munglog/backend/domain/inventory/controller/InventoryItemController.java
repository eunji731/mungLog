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

@Tag(name = "용품 관리", description = "반려동물 용품 관리 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/inventory")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    @Operation(summary = "용품 등록")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<InventoryItemResponse>> createItem(
            @AuthenticationPrincipal User user,
            @RequestPart("data") InventoryItemRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.ok(ApiResponse.success(inventoryItemService.createItem(uuid(user), request, images)));
    }

    @Operation(summary = "용품 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryItemResponse>>> getItems(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(inventoryItemService.getItems(uuid(user))));
    }

    @Operation(summary = "용품 상세 조회")
    @GetMapping("/{itemId}")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> getItem(
            @AuthenticationPrincipal User user,
            @PathVariable UUID itemId) {
        return ResponseEntity.ok(ApiResponse.success(inventoryItemService.getItem(itemId, uuid(user))));
    }

    @Operation(summary = "용품 수정")
    @PatchMapping(value = "/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<InventoryItemResponse>> updateItem(
            @AuthenticationPrincipal User user,
            @PathVariable UUID itemId,
            @RequestPart("data") InventoryItemRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.ok(ApiResponse.success(inventoryItemService.updateItem(itemId, uuid(user), request, images)));
    }

    @Operation(summary = "용품 삭제")
    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @AuthenticationPrincipal User user,
            @PathVariable UUID itemId) {
        inventoryItemService.deleteItem(itemId, uuid(user));
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "급여 중 토글")
    @PatchMapping("/{itemId}/feeding")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> toggleFeeding(
            @AuthenticationPrincipal User user,
            @PathVariable UUID itemId) {
        return ResponseEntity.ok(ApiResponse.success(inventoryItemService.toggleFeeding(itemId, uuid(user))));
    }

    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
