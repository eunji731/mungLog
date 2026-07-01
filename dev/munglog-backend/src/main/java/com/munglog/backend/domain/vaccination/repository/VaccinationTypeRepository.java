package com.munglog.backend.domain.vaccination.repository;

import com.munglog.backend.domain.vaccination.domain.VaccinationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * 예방접종 종류 레포지토리.
 * VaccinationType 엔티티에 대한 데이터 접근을 담당하는 인터페이스.
 * 그룹 기준 활성/전체 조회, 그룹 간 데이터 이전, 삭제 기능을 제공한다.
 */
public interface VaccinationTypeRepository extends JpaRepository<VaccinationType, Long> {

    /**
     * [목적] 그룹에서 사용 가능한 활성 접종 종류를 조회한다.
     * [설명] 전역(group=null) 항목과 해당 그룹 전용 항목을 함께 반환하며 활성 상태만 포함한다.
     *        전역 항목이 먼저, 그 다음 이름 오름차순으로 정렬된다.
     *
     * @param groupId 조회할 그룹 UUID
     * @return 활성 접종 종류 목록
     */
    @Query("""
            SELECT v FROM VaccinationType v
            WHERE (v.group IS NULL OR v.group.id = :groupId)
            AND v.isActive = true
            ORDER BY v.group NULLS FIRST, v.name
            """)
    List<VaccinationType> findActiveByGroup(@Param("groupId") UUID groupId);

    /**
     * [목적] 그룹에서 접근 가능한 전체 접종 종류를 조회한다. (비활성 포함)
     * [설명] 관리자 화면에서 전체 목록을 표시할 때 사용한다.
     *
     * @param groupId 조회할 그룹 UUID
     * @return 전체 접종 종류 목록
     */
    @Query("""
            SELECT v FROM VaccinationType v
            WHERE (v.group IS NULL OR v.group.id = :groupId)
            ORDER BY v.group NULLS FIRST, v.name
            """)
    List<VaccinationType> findAllByGroup(@Param("groupId") UUID groupId);

    /**
     * [목적] 사용자(그룹)가 생성한 활성 접종 종류를 모두 조회한다.
     * [설명] 관리자가 사용자 생성 접종 종류를 검토하거나 전역으로 승격할 때 사용한다.
     *
     * @return 사용자 생성 활성 접종 종류 목록
     */
    @Query("SELECT v FROM VaccinationType v WHERE v.group IS NOT NULL AND v.isActive = true ORDER BY v.name")
    List<VaccinationType> findAllUserCreated();

    /**
     * [목적] 특정 그룹의 접종 종류를 다른 그룹으로 일괄 이전한다.
     * [설명] 가족 그룹 합류 시 개인 그룹의 접종 종류를 새 그룹으로 이전할 때 사용한다.
     *
     * @param sourceGroupId 이전할 원본 그룹 UUID
     * @param targetGroupId 이전될 대상 그룹 UUID
     * @return 이전된 레코드 수
     */
    @Modifying
    @Query("UPDATE VaccinationType v SET v.group.id = :targetGroupId WHERE v.group.id = :sourceGroupId")
    int bulkMoveToGroup(@Param("sourceGroupId") UUID sourceGroupId, @Param("targetGroupId") UUID targetGroupId);

    /**
     * [목적] 특정 그룹의 접종 종류를 모두 삭제한다.
     * [설명] 전역 항목은 삭제하지 않고, 그룹 전용 항목만 삭제한다.
     *
     * @param groupId 삭제할 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM VaccinationType v WHERE v.group IS NOT NULL AND v.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
