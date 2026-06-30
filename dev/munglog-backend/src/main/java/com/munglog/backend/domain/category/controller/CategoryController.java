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

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/care")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCareCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCareCategories()));
    }

    @GetMapping("/schedule")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getScheduleCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getScheduleCategories()));
    }
}
