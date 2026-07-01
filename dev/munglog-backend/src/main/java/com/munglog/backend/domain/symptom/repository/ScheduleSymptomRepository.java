package com.munglog.backend.domain.symptom.repository;

import com.munglog.backend.domain.symptom.domain.ScheduleSymptom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * 일정-증상 연결 레포지토리.
 * ScheduleSymptom 엔티티에 대한 데이터 접근을 담당하는 인터페이스.
 * 일정 ID 기준 조회/삭제, 그룹 전체 삭제, 증상 ID 일괄 변경(병합) 기능을 제공한다.
 */
public interface ScheduleSymptomRepository extends JpaRepository<ScheduleSymptom, Long> {

    /**
     * [목적] 특정 일정에 연결된 증상 목록을 조회한다.
     *
     * @param scheduleId 조회할 일정 UUID
     * @return 해당 일정의 증상 연결 목록
     */
    List<ScheduleSymptom> findAllByScheduleId(UUID scheduleId);

    /**
     * [목적] 특정 일정에 연결된 증상을 모두 삭제한다.
     *
     * @param scheduleId 삭제할 일정 UUID
     */
    void deleteAllByScheduleId(UUID scheduleId);

    /**
     * [목적] 특정 그룹에 속한 일정의 증상 연결을 모두 삭제한다.
     *
     * @param groupId 삭제할 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM ScheduleSymptom ss WHERE ss.scheduleId IN (SELECT s.id FROM Schedule s WHERE s.pet.group.id = :groupId)")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);

    /**
     * [목적] 증상 병합 시 sourceId를 참조하는 레코드를 targetId로 일괄 변경한다.
     *
     * @param sourceId 병합될(삭제될) 증상 ID
     * @param targetId 병합 대상(유지될) 증상 ID
     */
    @Modifying
    @Query("UPDATE ScheduleSymptom ss SET ss.symptomId = :targetId WHERE ss.symptomId = :sourceId")
    void updateSymptomId(@Param("sourceId") Long sourceId, @Param("targetId") Long targetId);
}
