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

/**
 * 지도 기능 컨트롤러.
 * GPS 정보가 포함된 사진/추억을 지도 위에 표시하기 위한 데이터를 제공하는 클래스.
 * 주요 기능: 추억 목록 조회, 마커 조회, 키워드 검색, 검색어 자동완성
 */
@Tag(name = "지도", description = "지도 기반 일지 조회 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/map")
public class MapController {

    private final MapService mapService;

    /**
     * [목적] GPS 정보가 있는 추억 목록을 지도에 표시하기 위해 조회
     * [설명] 현재 로그인한 사용자의 그룹에 속한 사진 중 GPS 좌표가 있는 것을 반환한다.
     *
     * @param user Spring Security가 주입하는 현재 로그인 사용자 정보
     * @return GPS 좌표가 포함된 추억 목록
     */
    @Operation(summary = "지도 기반 추억 조회")
    @GetMapping("/memories")
    public ResponseEntity<ApiResponse<List<MapMemoryResponse>>> getMapMemories(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(mapService.getMapMemories(uuid(user))));
    }

    /**
     * [목적] 지도 위에 표시할 마커(핀) 데이터를 조회
     * [설명] 썸네일 이미지와 GPS 좌표를 포함한 가벼운 마커 정보를 반환한다.
     *        지도 초기 로딩 시 마커를 빠르게 렌더링하는 데 사용된다.
     *
     * @param user Spring Security가 주입하는 현재 로그인 사용자 정보
     * @return 지도 마커 목록 (좌표, 썸네일 포함)
     */
    @Operation(summary = "지도 마커 목록 조회")
    @GetMapping("/markers")
    public ResponseEntity<ApiResponse<List<MapMarkerResponse>>> getMapMarkers(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(mapService.getMapMarkers(uuid(user))));
    }

    /**
     * [목적] 검색창에서 자동완성 키워드를 제공
     * [설명] AI가 생성한 사진 캡션 목록을 중복 없이 반환하여 검색어 후보로 사용한다.
     *
     * @param user Spring Security가 주입하는 현재 로그인 사용자 정보
     * @return 검색어 자동완성 후보 문자열 목록
     */
    @Operation(summary = "검색어 자동완성")
    @GetMapping("/search/suggestions")
    public ResponseEntity<ApiResponse<List<String>>> getSearchSuggestions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(mapService.getSearchSuggestions(uuid(user))));
    }

    /**
     * [목적] 키워드로 추억을 검색하여 지도에 표시할 결과를 반환
     * [설명] AI 캡션, 위치명, 일지 제목 등을 기준으로 키워드와 일치하는 사진을 검색한다.
     *
     * @param user    Spring Security가 주입하는 현재 로그인 사용자 정보
     * @param keyword 검색할 키워드 문자열
     * @return 키워드에 매칭된 추억 목록
     */
    @Operation(summary = "지도 추억 검색")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MapMemoryResponse>>> searchMapMemories(
            @AuthenticationPrincipal User user,
            @RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success(mapService.searchMapMemories(uuid(user), keyword)));
    }

    /**
     * [목적] 특정 추억(일지)의 지도 상세 정보를 조회
     * [설명] 특정 memoryId에 해당하는 사진의 GPS 좌표와 AI 분석 정보를 반환한다.
     *
     * @param user     Spring Security가 주입하는 현재 로그인 사용자 정보
     * @param memoryId 조회할 추억(사진)의 UUID
     * @return 해당 추억의 상세 지도 정보
     * @throws IllegalArgumentException 사진 정보를 찾을 수 없는 경우
     */
    @Operation(summary = "일지 지도 상세 조회")
    @GetMapping("/memories/{memoryId}")
    public ResponseEntity<ApiResponse<MapMemoryResponse>> getMemoryDetail(
            @AuthenticationPrincipal User user,
            @PathVariable UUID memoryId) {
        return ResponseEntity.ok(ApiResponse.success(mapService.getMemoryDetail(uuid(user), memoryId)));
    }

    /**
     * [목적] Spring Security User 객체에서 UUID를 추출하는 헬퍼 메소드
     * [설명] JWT 토큰의 subject(userId)를 UUID 타입으로 변환하여 서비스 레이어에 전달한다.
     *
     * @param user Spring Security의 인증된 사용자 객체
     * @return 사용자 UUID
     */
    private UUID uuid(User user) {
        return UUID.fromString(user.getUsername());
    }
}
