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

@Tag(name = "반려동물", description = "반려동물 CRUD API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;

    @Operation(summary = "반려동물 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PetResponse>>> getPets(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(petService.getPets(uuid(user))));
    }

    @Operation(summary = "반려동물 등록")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PetResponse>> createPet(
            @AuthenticationPrincipal User user,
            @RequestPart("data") PetRequest request,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        return ResponseEntity.ok(ApiResponse.success(petService.createPet(uuid(user), request, profileImage)));
    }

    @Operation(summary = "반려동물 수정")
    @PutMapping(value = "/{petId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PetResponse>> updatePet(
            @AuthenticationPrincipal User user,
            @PathVariable UUID petId,
            @RequestPart("data") PetRequest request,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        return ResponseEntity.ok(ApiResponse.success(petService.updatePet(petId, uuid(user), request, profileImage)));
    }

    @Operation(summary = "반려동물 삭제")
    @DeleteMapping("/{petId}")
    public ResponseEntity<ApiResponse<Void>> deletePet(
            @AuthenticationPrincipal User user,
            @PathVariable UUID petId) {
        petService.deletePet(petId, uuid(user));
        return ResponseEntity.ok(ApiResponse.success());
    }

    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
