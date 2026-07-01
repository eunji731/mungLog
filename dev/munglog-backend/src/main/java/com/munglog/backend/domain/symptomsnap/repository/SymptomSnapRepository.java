package com.munglog.backend.domain.symptomsnap.repository;

import com.munglog.backend.domain.symptomsnap.domain.SymptomSnap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 증상 스냅 레포지토리.
 * SymptomSnap 엔티티에 대한 데이터 접근을 담당하는 인터페이스.
 * 그룹 기준 필터 검색, 진료 기록·일정 연동 조회, 그룹 전체 삭제 기능을 제공한다.
 */
public interface SymptomSnapRepository extends JpaRepository<SymptomSnap, UUID> {

    /**
     * [목적] 스냅 ID와 사용자 ID로 증상 스냅을 조회한다.
     *
     * @param id     조회할 스냅 UUID
     * @param userId 사용자 UUID
     * @return 해당 스냅 (없으면 empty)
     */
    Optional<SymptomSnap> findByIdAndUser_Id(UUID id, UUID userId);

    /**
     * [목적] 스냅 ID와 그룹 ID로 증상 스냅을 조회한다.
     * [설명] 타 그룹의 스냅에 접근하지 못하도록 그룹 소속 여부를 함께 검증한다.
     *
     * @param id      조회할 스냅 UUID
     * @param groupId 그룹 UUID
     * @return 해당 스냅 (없으면 empty)
     */
    @Query("SELECT s FROM SymptomSnap s WHERE s.pet.group.id = :groupId AND s.id = :id")
    Optional<SymptomSnap> findByIdAndGroupId(@Param("id") UUID id, @Param("groupId") UUID groupId);

    /**
     * [목적] 특정 일정과 연동된 증상 스냅 목록을 조회한다.
     * [설명] 일정 삭제 시 연동 해제에 사용한다.
     *
     * @param linkedScheduleId 연동된 일정 UUID
     * @return 해당 일정과 연동된 스냅 목록
     */
    List<SymptomSnap> findByLinkedScheduleId(UUID linkedScheduleId);

    /**
     * [목적] 특정 진료 기록과 연동된 증상 스냅 목록을 조회한다.
     * [설명] 진료 기록 삭제 시 연동 해제에 사용한다.
     *
     * @param resolvedRecordId 연동된 진료 기록 UUID
     * @return 해당 진료 기록과 연동된 스냅 목록
     */
    List<SymptomSnap> findByResolvedRecordId(UUID resolvedRecordId);

    /**
     * [목적] 그룹 기준으로 증상 스냅을 필터 조회한다.
     * [설명] 반려동물·날짜 범위 필터를 선택적으로 적용하며, 최신 순으로 반환한다.
     *
     * @param groupId   그룹 UUID
     * @param petId     반려동물 UUID 필터 (null이면 전체)
     * @param startDate 조회 시작일 (null이면 제한 없음)
     * @param endDate   조회 종료일 (null이면 제한 없음)
     * @return 필터링된 증상 스냅 목록 (날짜·시각 내림차순)
     */
    @Query("SELECT s FROM SymptomSnap s WHERE s.pet.group.id = :groupId " +
            "AND (:petId IS NULL OR s.pet.id = :petId) " +
            "AND (:startDate IS NULL OR s.date >= :startDate) " +
            "AND (:endDate IS NULL OR s.date <= :endDate) " +
            "ORDER BY s.date DESC, s.time DESC")
    List<SymptomSnap> searchByGroup(@Param("groupId") UUID groupId, @Param("petId") UUID petId,
                                     @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * [목적] 그룹에 속한 반려동물의 모든 증상 스냅을 삭제한다.
     * [설명] 그룹 해체 또는 탈퇴 시 데이터 정리에 사용한다.
     *
     * @param groupId 삭제할 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM SymptomSnap s WHERE s.pet.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
