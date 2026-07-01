package com.munglog.backend.domain.symptom.repository;

import com.munglog.backend.domain.symptom.domain.CareRecordSymptom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * 진료 기록-증상 연결 레포지토리.
 * CareRecordSymptom 엔티티에 대한 데이터 접근을 담당하는 인터페이스.
 * 진료 기록 ID 기준 조회/삭제, 그룹 전체 삭제, 증상 ID 일괄 변경(병합) 기능을 제공한다.
 */
public interface CareRecordSymptomRepository extends JpaRepository<CareRecordSymptom, Long> {

    /**
     * [목적] 특정 진료 기록에 연결된 증상 목록을 조회한다.
     *
     * @param careRecordId 조회할 진료 기록 UUID
     * @return 해당 진료 기록의 증상 연결 목록
     */
    List<CareRecordSymptom> findAllByCareRecordId(UUID careRecordId);

    /**
     * [목적] 특정 진료 기록에 연결된 증상을 모두 삭제한다.
     *
     * @param careRecordId 삭제할 진료 기록 UUID
     */
    void deleteAllByCareRecordId(UUID careRecordId);

    /**
     * [목적] 특정 그룹에 속한 반려동물의 진료 기록-증상 연결을 모두 삭제한다.
     * [설명] 그룹 탈퇴 또는 그룹 삭제 시 관련 데이터를 정리하는 데 사용한다.
     *
     * @param groupId 삭제할 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM CareRecordSymptom crs WHERE crs.petId IN (SELECT p.id FROM Pet p WHERE p.group.id = :groupId)")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);

    /**
     * [목적] 증상 병합 시 sourceId를 참조하는 레코드를 targetId로 일괄 변경한다.
     *
     * @param sourceId 병합될(삭제될) 증상 ID
     * @param targetId 병합 대상(유지될) 증상 ID
     */
    @Modifying
    @Query("UPDATE CareRecordSymptom crs SET crs.symptomId = :targetId WHERE crs.symptomId = :sourceId")
    void updateSymptomId(@Param("sourceId") Long sourceId, @Param("targetId") Long targetId);
}
