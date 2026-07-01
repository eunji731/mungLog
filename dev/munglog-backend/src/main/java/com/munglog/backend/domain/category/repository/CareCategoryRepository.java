package com.munglog.backend.domain.category.repository;

import com.munglog.backend.domain.category.domain.CareCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 케어기록 카테고리 리포지토리.
 * 케어 카테고리 데이터를 DB에서 조회·저장하기 위한 JPA 리포지토리 인터페이스.
 */
public interface CareCategoryRepository extends JpaRepository<CareCategory, Long> {

    /**
     * [목적] 활성화된 케어 카테고리를 정렬 순서대로 조회한다.
     * [설명] isActive = true인 카테고리만 sortOrder 오름차순으로 반환한다.
     *
     * @return 활성화된 케어 카테고리 목록 (정렬 순서 오름차순)
     */
    List<CareCategory> findAllByIsActiveTrueOrderBySortOrderAsc();

    /**
     * [목적] 코드로 특정 케어 카테고리를 조회한다.
     *
     * @param code 카테고리 코드 (예: "HOSPITAL")
     * @return 해당 코드의 카테고리 (없으면 empty)
     */
    Optional<CareCategory> findByCode(String code);

    /**
     * [목적] 특정 코드의 케어 카테고리 존재 여부를 확인한다.
     * [설명] 중복 코드 검사 시 사용한다.
     *
     * @param code 확인할 카테고리 코드
     * @return 존재하면 true, 없으면 false
     */
    boolean existsByCode(String code);
}
