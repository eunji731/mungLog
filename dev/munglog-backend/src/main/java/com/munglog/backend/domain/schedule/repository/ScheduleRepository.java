package com.munglog.backend.domain.schedule.repository;

import com.munglog.backend.domain.schedule.domain.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 일정(Schedule) 레포지토리.
 * Schedule 엔티티의 DB 조회·삭제 쿼리를 정의하는 인터페이스.
 * 그룹 ID 기반으로 조회하여 그룹 간 데이터 접근을 방지한다.
 */
public interface ScheduleRepository extends JpaRepository<Schedule, UUID> {

    /**
     * [목적] 그룹 + 반려동물 기준으로 키워드 일치 일정을 조회한다. (제목·메모 검색)
     *
     * @param groupId 가족 그룹 UUID (pet.group.id)
     * @param petId   반려동물 UUID
     * @param keyword 검색 키워드 (대소문자 무시)
     * @return 일정 목록 (날짜 오름차순)
     */
    @Query("SELECT s FROM Schedule s WHERE s.pet.group.id = :groupId AND s.pet.id = :petId AND (LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.memo) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY s.scheduleDate ASC")
    List<Schedule> findByGroupIdAndPetIdAndKeyword(@Param("groupId") UUID groupId, @Param("petId") UUID petId, @Param("keyword") String keyword);

    /**
     * [목적] 그룹 전체 기준으로 키워드 일치 일정을 조회한다.
     *
     * @param groupId 가족 그룹 UUID
     * @param keyword 검색 키워드 (대소문자 무시)
     * @return 일정 목록 (날짜 오름차순)
     */
    @Query("SELECT s FROM Schedule s WHERE s.pet.group.id = :groupId AND (LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.memo) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY s.scheduleDate ASC")
    List<Schedule> findByGroupIdAndKeyword(@Param("groupId") UUID groupId, @Param("keyword") String keyword);

    /**
     * [목적] 그룹 + 반려동물 기준으로 전체 일정을 조회한다.
     *
     * @param groupId 가족 그룹 UUID
     * @param petId   반려동물 UUID
     * @return 일정 목록 (날짜 오름차순)
     */
    @Query("SELECT s FROM Schedule s WHERE s.pet.group.id = :groupId AND s.pet.id = :petId ORDER BY s.scheduleDate ASC")
    List<Schedule> findByGroupIdAndPetId(@Param("groupId") UUID groupId, @Param("petId") UUID petId);

    /**
     * [목적] 그룹 전체 일정을 조회한다.
     *
     * @param groupId 가족 그룹 UUID
     * @return 일정 목록 (날짜 오름차순)
     */
    @Query("SELECT s FROM Schedule s WHERE s.pet.group.id = :groupId ORDER BY s.scheduleDate ASC")
    List<Schedule> findByGroupId(@Param("groupId") UUID groupId);

    /**
     * [목적] 일정 ID와 그룹 ID로 단건 조회한다. (그룹 접근 권한 검증용)
     *
     * @param id      일정 UUID
     * @param groupId 가족 그룹 UUID
     * @return 일정 Optional
     */
    @Query("SELECT s FROM Schedule s WHERE s.id = :id AND s.pet.group.id = :groupId")
    Optional<Schedule> findByIdAndGroupId(@Param("id") UUID id, @Param("groupId") UUID groupId);

    /**
     * [목적] 그룹 삭제 시 해당 그룹의 모든 일정을 삭제한다.
     *
     * @param groupId 삭제할 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM Schedule s WHERE s.pet.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
