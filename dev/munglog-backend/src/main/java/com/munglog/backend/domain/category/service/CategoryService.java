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

/**
 * 카테고리 서비스.
 * 케어기록 카테고리와 일정 카테고리의 생성·조회·수정·삭제 비즈니스 로직을 담당하는 클래스.
 * 주요 기능: 카테고리 CRUD (케어/일정 구분)
 */
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CareCategoryRepository careCategoryRepository;
    private final ScheduleCategoryRepository scheduleCategoryRepository;

    // ─── Care Category ────────────────────────────────────────────

    /**
     * [목적] 활성화된 케어 카테고리 목록을 반환한다.
     * [설명] isActive = true인 항목만 정렬 순서 오름차순으로 조회한다.
     *
     * @return 케어 카테고리 응답 목록
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCareCategories() {
        return careCategoryRepository.findAllByIsActiveTrueOrderBySortOrderAsc()
                .stream().map(CategoryResponse::from).toList();
    }

    /**
     * [목적] 새로운 케어 카테고리를 생성한다.
     * [설명] 코드를 대문자로 정규화한 뒤 중복 여부를 검사하고 저장한다.
     *        sortOrder가 null이면 99(기타)로 설정된다.
     *
     * @param req 카테고리 생성 요청 (code, displayName, icon, sortOrder)
     * @return 생성된 카테고리 응답
     * @throws IllegalArgumentException 동일한 코드가 이미 존재할 때 발생
     */
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

    /**
     * [목적] 기존 케어 카테고리 정보를 수정한다.
     * [설명] id로 카테고리를 조회한 뒤 displayName, icon, sortOrder를 업데이트한다.
     *
     * @param id  수정할 카테고리 id
     * @param req 수정 요청 데이터
     * @return 수정된 카테고리 응답
     * @throws IllegalArgumentException 해당 id의 카테고리가 없을 때 발생
     */
    @Transactional
    public CategoryResponse updateCareCategory(Long id, CategoryRequest req) {
        CareCategory category = careCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        category.update(req.getDisplayName(), req.getIcon(), req.getSortOrder());
        return CategoryResponse.from(category);
    }

    /**
     * [목적] 케어 카테고리를 비활성화(논리 삭제)한다.
     * [설명] 시스템 카테고리는 비활성화할 수 없다. 물리 삭제 대신 isActive = false로 처리한다.
     *
     * @param id 비활성화할 카테고리 id
     * @throws IllegalArgumentException 해당 id의 카테고리가 없을 때 발생
     * @throws IllegalStateException    시스템 카테고리를 비활성화하려 할 때 발생
     */
    @Transactional
    public void deleteCareCategory(Long id) {
        CareCategory category = careCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        category.deactivate();
    }

    // ─── Schedule Category ─────────────────────────────────────────

    /**
     * [목적] 활성화된 일정 카테고리 목록을 반환한다.
     * [설명] isActive = true인 항목만 정렬 순서 오름차순으로 조회한다.
     *
     * @return 일정 카테고리 응답 목록
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getScheduleCategories() {
        return scheduleCategoryRepository.findAllByIsActiveTrueOrderBySortOrderAsc()
                .stream().map(CategoryResponse::from).toList();
    }

    /**
     * [목적] 새로운 일정 카테고리를 생성한다.
     * [설명] 코드를 대문자로 정규화한 뒤 중복 여부를 검사하고 저장한다.
     *        sortOrder가 null이면 99(기타)로 설정된다.
     *
     * @param req 카테고리 생성 요청 (code, displayName, icon, sortOrder)
     * @return 생성된 카테고리 응답
     * @throws IllegalArgumentException 동일한 코드가 이미 존재할 때 발생
     */
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

    /**
     * [목적] 기존 일정 카테고리 정보를 수정한다.
     * [설명] id로 카테고리를 조회한 뒤 displayName, icon, sortOrder를 업데이트한다.
     *
     * @param id  수정할 카테고리 id
     * @param req 수정 요청 데이터
     * @return 수정된 카테고리 응답
     * @throws IllegalArgumentException 해당 id의 카테고리가 없을 때 발생
     */
    @Transactional
    public CategoryResponse updateScheduleCategory(Long id, CategoryRequest req) {
        ScheduleCategory category = scheduleCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        category.update(req.getDisplayName(), req.getIcon(), req.getSortOrder());
        return CategoryResponse.from(category);
    }

    /**
     * [목적] 일정 카테고리를 비활성화(논리 삭제)한다.
     * [설명] 시스템 카테고리는 비활성화할 수 없다. 물리 삭제 대신 isActive = false로 처리한다.
     *
     * @param id 비활성화할 카테고리 id
     * @throws IllegalArgumentException 해당 id의 카테고리가 없을 때 발생
     * @throws IllegalStateException    시스템 카테고리를 비활성화하려 할 때 발생
     */
    @Transactional
    public void deleteScheduleCategory(Long id) {
        ScheduleCategory category = scheduleCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        category.deactivate();
    }
}
