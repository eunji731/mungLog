package com.munglog.backend.domain.symptom.repository;

import com.munglog.backend.domain.symptom.domain.SymptomSnapSymptom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * 증상 스냅-증상 연결 레포지토리.
 * SymptomSnapSymptom 엔티티에 대한 데이터 접근을 담당하는 인터페이스.
 * 스냅 ID 기준 조회/삭제, 그룹 전체 삭제, 증상 ID 일괄 변경(병합) 기능을 제공한다.
 */
public interface SymptomSnapSymptomRepository extends JpaRepository<SymptomSnapSymptom, Long> {

    /**
     * [목적] 특정 증상 스냅에 연결된 증상 목록을 조회한다.
     *
     * @param symptomSnapId 조회할 증상 스냅 UUID
     * @return 해당 스냅의 증상 연결 목록
     */
    List<SymptomSnapSymptom> findAllBySymptomSnapId(UUID symptomSnapId);

    /**
     * [목적] 특정 증상 스냅에 연결된 증상을 모두 삭제한다.
     *
     * @param symptomSnapId 삭제할 증상 스냅 UUID
     */
    void deleteAllBySymptomSnapId(UUID symptomSnapId);

    /**
     * [목적] 특정 그룹에 속한 증상 스냅의 증상 연결을 모두 삭제한다.
     *
     * @param groupId 삭제할 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM SymptomSnapSymptom sss WHERE sss.symptomSnapId IN (SELECT s.id FROM SymptomSnap s WHERE s.pet.group.id = :groupId)")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);

    /**
     * [목적] 증상 병합 시 sourceId를 참조하는 레코드를 targetId로 일괄 변경한다.
     *
     * @param sourceId 병합될(삭제될) 증상 ID
     * @param targetId 병합 대상(유지될) 증상 ID
     */
    @Modifying
    @Query("UPDATE SymptomSnapSymptom sss SET sss.symptomId = :targetId WHERE sss.symptomId = :sourceId")
    void updateSymptomId(@Param("sourceId") Long sourceId, @Param("targetId") Long targetId);
}
