package com.munglog.backend.domain.category.service;

import com.munglog.backend.domain.category.domain.CareCategory;
import com.munglog.backend.domain.category.domain.ScheduleCategory;
import com.munglog.backend.domain.category.dto.CategoryRequest;
import com.munglog.backend.domain.category.dto.CategoryResponse;
import com.munglog.backend.domain.category.repository.CareCategoryRepository;
import com.munglog.backend.domain.category.repository.ScheduleCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CareCategoryRepository careCategoryRepository;
    private final ScheduleCategoryRepository scheduleCategoryRepository;

    // ─── Care Category ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCareCategories() {
        return careCategoryRepository.findAllByIsActiveTrueOrderBySortOrderAsc()
                .stream().map(CategoryResponse::from).toList();
    }

    @Transactional
    public CategoryResponse createCareCategory(CategoryRequest req) {
        if (careCategoryRepository.existsByCode(req.getCode().toUpperCase().trim())) {
            throw new IllegalArgumentException("이미 존재하는 코드입니다: " + req.getCode());
        }
        CareCategory saved = careCategoryRepository.save(CareCategory.builder()
                .code(req.getCode().toUpperCase().trim())
                .displayName(req.getDisplayName())
                .icon(req.getIcon())
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 99)
                .isSystem(false)
                .build());
        return CategoryResponse.from(saved);
    }

    @Transactional
    public CategoryResponse updateCareCategory(Long id, CategoryRequest req) {
        CareCategory category = careCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        category.update(req.getDisplayName(), req.getIcon(), req.getSortOrder());
        return CategoryResponse.from(category);
    }

    @Transactional
    public void deleteCareCategory(Long id) {
        CareCategory category = careCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        category.deactivate();
    }

    // ─── Schedule Category ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CategoryResponse> getScheduleCategories() {
        return scheduleCategoryRepository.findAllByIsActiveTrueOrderBySortOrderAsc()
                .stream().map(CategoryResponse::from).toList();
    }

    @Transactional
    public CategoryResponse createScheduleCategory(CategoryRequest req) {
        if (scheduleCategoryRepository.existsByCode(req.getCode().toUpperCase().trim())) {
            throw new IllegalArgumentException("이미 존재하는 코드입니다: " + req.getCode());
        }
        ScheduleCategory saved = scheduleCategoryRepository.save(ScheduleCategory.builder()
                .code(req.getCode().toUpperCase().trim())
                .displayName(req.getDisplayName())
                .icon(req.getIcon())
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 99)
                .isSystem(false)
                .build());
        return CategoryResponse.from(saved);
    }

    @Transactional
    public CategoryResponse updateScheduleCategory(Long id, CategoryRequest req) {
        ScheduleCategory category = scheduleCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        category.update(req.getDisplayName(), req.getIcon(), req.getSortOrder());
        return CategoryResponse.from(category);
    }

    @Transactional
    public void deleteScheduleCategory(Long id) {
        ScheduleCategory category = scheduleCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        category.deactivate();
    }
}
