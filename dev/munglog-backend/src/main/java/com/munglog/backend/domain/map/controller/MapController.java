package com.munglog.backend.domain.map.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.map.dto.MapMarkerResponse;
import com.munglog.backend.domain.map.dto.MapMemoryResponse;
import com.munglog.backend.domain.map.service.MapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "지도", description = "지도 기반 일지 조회 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/map")
public class MapController {

    private final MapService mapService;

    @Operation(summary = "지도 기반 추억 조회")
    @GetMapping("/memories")
    public ResponseEntity<ApiResponse<List<MapMemoryResponse>>> getMapMemories(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(mapService.getMapMemories(uuid(user))));
    }

    @Operation(summary = "지도 마커 목록 조회")
    @GetMapping("/markers")
    public ResponseEntity<ApiResponse<List<MapMarkerResponse>>> getMapMarkers(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(mapService.getMapMarkers(uuid(user))));
    }

    @Operation(summary = "검색어 자동완성")
    @GetMapping("/search/suggestions")
    public ResponseEntity<ApiResponse<List<String>>> getSearchSuggestions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(mapService.getSearchSuggestions(uuid(user))));
    }

    @Operation(summary = "지도 추억 검색")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MapMemoryResponse>>> searchMapMemories(
            @AuthenticationPrincipal User user,
            @RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success(mapService.searchMapMemories(uuid(user), keyword)));
    }

    @Operation(summary = "일지 지도 상세 조회")
    @GetMapping("/memories/{memoryId}")
    public ResponseEntity<ApiResponse<MapMemoryResponse>> getMemoryDetail(
            @AuthenticationPrincipal User user,
            @PathVariable UUID memoryId) {
        return ResponseEntity.ok(ApiResponse.success(mapService.getMemoryDetail(uuid(user), memoryId)));
    }

    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
