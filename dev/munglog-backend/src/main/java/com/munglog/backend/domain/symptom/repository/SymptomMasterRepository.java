package com.munglog.backend.domain.symptom.repository;

import com.munglog.backend.domain.symptom.domain.SymptomMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 증상 마스터 레포지토리.
 * SymptomMaster 엔티티에 대한 데이터 접근을 담당하는 인터페이스.
 * 이름 기반 조회, 키워드 검색, 전체 정렬 조회 기능을 제공한다.
 */
public interface SymptomMasterRepository extends JpaRepository<SymptomMaster, Long> {

    /**
     * [목적] 증상명이 정확히 일치하는 증상을 조회한다.
     *
     * @param name 검색할 증상명
     * @return 해당 이름의 증상 (없으면 empty)
     */
    Optional<SymptomMaster> findByName(String name);

    /**
     * [목적] 증상명에 키워드가 포함된 증상 목록을 대소문자 무관 조회한다.
     *
     * @param keyword 검색 키워드
     * @return 키워드가 포함된 증상 목록
     */
    List<SymptomMaster> findByNameContainingIgnoreCase(String keyword);

    /**
     * [목적] 모든 증상을 활성 우선·이름 오름차순으로 조회한다.
     * [설명] 관리자 화면에서 전체 목록을 표시할 때 사용한다.
     *
     * @return 활성 우선·이름 오름차순 정렬된 증상 전체 목록
     */
    List<SymptomMaster> findAllByOrderByIsActiveDescNameAsc();
}
