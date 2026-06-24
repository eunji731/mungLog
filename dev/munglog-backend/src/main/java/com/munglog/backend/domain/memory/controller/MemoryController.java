package com.munglog.backend.domain.memory.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.memory.dto.MemoryListResponse;
import com.munglog.backend.domain.memory.service.MemoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Tag(name = "일지", description = "반려동물 일지 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/memories")
public class MemoryController {

    private final MemoryService memoryService;

    @Operation(summary = "일지 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<MemoryListResponse>>> getMemories(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(
                memoryService.getMemories(UUID.fromString(user.getUsername()), startDate, endDate)));
    }

    @Operation(summary = "일지 삭제")
    @DeleteMapping("/{memoryId}")
    public ResponseEntity<ApiResponse<Void>> deleteMemory(
            @AuthenticationPrincipal User user,
            @PathVariable UUID memoryId) {
        memoryService.deleteMemory(memoryId, UUID.fromString(user.getUsername()));
        return ResponseEntity.ok(ApiResponse.success());
    }
}
