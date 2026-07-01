package com.munglog.backend.domain.vaccination.repository;

import com.munglog.backend.domain.vaccination.domain.VaccinationAlias;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 예방접종 별칭 레포지토리.
 * VaccinationAlias 엔티티에 대한 데이터 접근을 담당하는 인터페이스.
 * 대소문자 무관 별칭 검색, 접종 종류별 목록 조회, 그룹 전체 삭제 기능을 제공한다.
 */
public interface VaccinationAliasRepository extends JpaRepository<VaccinationAlias, Long> {

    /**
     * [목적] 별칭이 정확히 일치하는(대소문자 무관) 항목을 조회한다.
     *
     * @param alias 검색할 별칭 문자열
     * @return 매칭된 별칭 (없으면 empty)
     */
    Optional<VaccinationAlias> findByAliasIgnoreCase(String alias);

    /**
     * [목적] 별칭에 키워드가 포함된 항목을 대소문자 무관으로 조회한다.
     *
     * @param keyword 검색 키워드
     * @return 키워드가 포함된 별칭 목록
     */
    @Query("""
            SELECT a FROM VaccinationAlias a
            WHERE LOWER(a.alias) LIKE LOWER(CONCAT('%', :keyword, '%'))
            """)
    List<VaccinationAlias> findByAliasContainingIgnoreCase(@Param("keyword") String keyword);

    /**
     * [목적] 특정 접종 종류에 등록된 모든 별칭을 조회한다.
     *
     * @param vaccinationTypeId 조회할 접종 종류 ID
     * @return 해당 접종 종류의 별칭 목록
     */
    List<VaccinationAlias> findByVaccinationTypeId(Long vaccinationTypeId);

    /**
     * [목적] 별칭이 이미 등록되어 있는지 확인한다.
     *
     * @param alias 확인할 별칭 문자열
     * @return 이미 존재하면 true
     */
    boolean existsByAlias(String alias);

    /**
     * [목적] 특정 그룹에 속한 접종 종류의 별칭을 모두 삭제한다.
     * [설명] 그룹 해체 시 그룹 전용 접종 종류와 함께 별칭도 정리한다.
     *
     * @param groupId 삭제할 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM VaccinationAlias va WHERE va.vaccinationType.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
