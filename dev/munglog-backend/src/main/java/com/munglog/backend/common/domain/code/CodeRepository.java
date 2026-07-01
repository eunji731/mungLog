package com.munglog.backend.common.domain.code;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 공통 코드 JPA 레포지토리.
 * 타입별 코드 조회, 코드 값으로 단건 조회 기능을 제공한다.
 */
public interface CodeRepository extends JpaRepository<Code, String> {

    /**
     * [목적] 특정 타입의 사용 중인 코드 목록을 정렬 순서대로 조회한다.
     *
     * @param type  코드 분류 타입 (예: ROLE)
     * @param useYn 사용 여부 필터 ("Y" 또는 "N")
     * @return sortOrder 오름차순으로 정렬된 코드 목록
     */
    List<Code> findByTypeAndUseYnOrderBySortOrder(CodeType type, String useYn);

    /**
     * [목적] 코드 값(code 필드)으로 단건 코드를 조회한다.
     *
     * @param code 조회할 코드 값 (예: "ROLE_USER")
     * @return 코드 Optional
     */
    Optional<Code> findByCode(String code);
}
