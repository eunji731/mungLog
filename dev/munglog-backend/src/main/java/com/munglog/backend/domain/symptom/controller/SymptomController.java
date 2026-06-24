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

@Tag(name = "증상", description = "증상 마스터 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/symptoms")
public class SymptomController {

    private final SymptomService symptomService;

    @Operation(summary = "증상 검색")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<SymptomResponse>>> searchSymptoms(@RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success(symptomService.searchSymptoms(keyword)));
    }
}
