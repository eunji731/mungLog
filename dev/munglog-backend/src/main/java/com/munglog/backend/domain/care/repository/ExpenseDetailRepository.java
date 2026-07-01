package com.munglog.backend.domain.care.repository;

import com.munglog.backend.domain.care.domain.ExpenseDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

/**
 * 지출 상세 레포지토리.
 * ExpenseDetail 엔티티의 기본 CRUD 및 그룹 단위 벌크 삭제를 지원하는 인터페이스.
 */
public interface ExpenseDetailRepository extends JpaRepository<ExpenseDetail, UUID> {

    /**
     * [목적] 그룹 내 모든 지출 상세 기록을 벌크 삭제한다.
     * [설명] 그룹 탈퇴·해체 시 케어 기록과 함께 연쇄 삭제되어야 하는 데이터를 일괄 제거한다.
     *
     * @param groupId 삭제할 가족 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM ExpenseDetail ed WHERE ed.careRecord.pet.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
