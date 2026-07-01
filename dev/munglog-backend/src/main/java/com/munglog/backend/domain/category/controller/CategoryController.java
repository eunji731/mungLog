package com.munglog.backend.domain.category.controller;

import com.munglog.backend.common.dto.ApiResponse;
import com.munglog.backend.domain.category.dto.CategoryResponse;
import com.munglog.backend.domain.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 카테고리 컨트롤러.
 * 케어기록 카테고리와 일정 카테고리 목록을 조회하는 REST API를 제공하는 클래스.
 * 주요 기능: 케어 카테고리 목록 조회, 일정 카테고리 목록 조회
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * [목적] 케어기록에서 사용할 카테고리 목록을 반환한다.
     * [설명] 활성화된 케어 카테고리를 정렬 순서(sortOrder) 기준으로 조회한다.
     *
     * @return 케어 카테고리 목록 (id, code, 표시명, 아이콘, 정렬순서, 시스템 여부 포함)
     */
    @GetMapping("/care")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCareCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCareCategories()));
    }

    /**
     * [목적] 일정에서 사용할 카테고리 목록을 반환한다.
     * [설명] 활성화된 일정 카테고리를 정렬 순서(sortOrder) 기준으로 조회한다.
     *
     * @return 일정 카테고리 목록 (id, code, 표시명, 아이콘, 정렬순서, 시스템 여부 포함)
     */
    @GetMapping("/schedule")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getScheduleCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getScheduleCategories()));
    }
}
