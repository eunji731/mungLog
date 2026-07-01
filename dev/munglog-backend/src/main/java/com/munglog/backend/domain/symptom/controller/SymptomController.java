package com.munglog.backend.domain.symptom.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.symptom.dto.SymptomResponse;
import com.munglog.backend.domain.symptom.service.SymptomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 증상 마스터 컨트롤러.
 * 증상 검색 API 엔드포인트를 제공하는 컨트롤러 클래스.
 * 주요 기능: 키워드로 증상 검색
 */
@Tag(name = "증상", description = "증상 마스터 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/symptoms")
public class SymptomController {

    private final SymptomService symptomService;

    /**
     * [목적] 키워드로 증상 마스터 목록을 검색한다.
     *
     * @param keyword 검색할 증상명 키워드
     * @return 매칭되는 증상 응답 DTO 목록
     */
    @Operation(summary = "증상 검색")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<SymptomResponse>>> searchSymptoms(@RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success(symptomService.searchSymptoms(keyword)));
    }
}
