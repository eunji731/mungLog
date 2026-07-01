package com.munglog.backend.domain.memory.repository;

import com.munglog.backend.domain.memory.domain.MemoryMoment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 기억 장소(Moment) 레포지토리.
 * MemoryMoment 엔티티의 DB 조회·삭제 쿼리를 정의하는 인터페이스.
 * 대시보드와 지도 기능에서 자주 방문한 장소, 에너지 수준 통계에 사용된다.
 */
public interface MemoryMomentRepository extends JpaRepository<MemoryMoment, UUID> {

    /**
     * [목적] 그룹 전체의 자주 방문한 장소를 방문 횟수 내림차순으로 조회한다.
     *
     * @param groupId 가족 그룹 UUID
     * @return [locationName, count] 형태의 Object[] 목록
     */
    @Query("SELECT mm.locationName, COUNT(mm) as cnt FROM MemoryMoment mm WHERE mm.memory.group.id = :groupId AND mm.locationName IS NOT NULL GROUP BY mm.locationName ORDER BY cnt DESC")
    List<Object[]> findFavoritePlacesByGroup(@Param("groupId") UUID groupId);

    /**
     * [목적] 특정 반려동물이 포함된 기억의 자주 방문 장소를 조회한다.
     *
     * @param groupId 가족 그룹 UUID
     * @param petId   반려동물 UUID
     * @return [locationName, count] 형태의 Object[] 목록
     */
    @Query("SELECT mm.locationName, COUNT(mm) as cnt FROM MemoryMoment mm JOIN mm.memory m JOIN m.memoryDogs md WHERE m.group.id = :groupId AND md.dog.id = :petId AND mm.locationName IS NOT NULL GROUP BY mm.locationName ORDER BY cnt DESC")
    List<Object[]> findFavoritePlacesByGroupAndPet(@Param("groupId") UUID groupId, @Param("petId") UUID petId);

    /**
     * [목적] 기간 내 그룹이 방문한 고유 장소 수를 집계한다.
     *
     * @param groupId 가족 그룹 UUID
     * @param start   시작일
     * @param end     종료일
     * @return 고유 장소 수
     */
    @Query("SELECT COUNT(DISTINCT mm.locationName) FROM MemoryMoment mm WHERE mm.memory.group.id = :groupId AND mm.locationName IS NOT NULL AND mm.memory.memoryDate BETWEEN :start AND :end")
    long countDistinctVisitedPlacesByGroup(@Param("groupId") UUID groupId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    /**
     * [목적] 기간 내 특정 반려동물 포함 기억의 고유 장소 수를 집계한다.
     *
     * @param groupId 가족 그룹 UUID
     * @param petId   반려동물 UUID
     * @param start   시작일
     * @param end     종료일
     * @return 고유 장소 수
     */
    @Query("SELECT COUNT(DISTINCT mm.locationName) FROM MemoryMoment mm JOIN mm.memory m JOIN m.memoryDogs md WHERE m.group.id = :groupId AND md.dog.id = :petId AND mm.locationName IS NOT NULL AND m.memoryDate BETWEEN :start AND :end")
    long countDistinctVisitedPlacesByGroupAndPet(@Param("groupId") UUID groupId, @Param("petId") UUID petId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    // ──────────────────────────────────────────────
    // 이하 하위 호환용 user-based 쿼리 (그룹 기반으로 마이그레이션 예정)
    // ──────────────────────────────────────────────

    /** @deprecated 그룹 기반 쿼리(findFavoritePlacesByGroup)를 사용하세요. */
    @Query("SELECT mm.locationName, COUNT(mm) as cnt FROM MemoryMoment mm WHERE mm.memory.user.id = :userId AND mm.locationName IS NOT NULL GROUP BY mm.locationName ORDER BY cnt DESC")
    List<Object[]> findFavoritePlaces(@Param("userId") UUID userId);

    /** @deprecated 그룹 기반 쿼리(findFavoritePlacesByGroupAndPet)를 사용하세요. */
    @Query("SELECT mm.locationName, COUNT(mm) as cnt FROM MemoryMoment mm JOIN mm.memory m JOIN m.memoryDogs md WHERE m.user.id = :userId AND md.dog.id = :petId AND mm.locationName IS NOT NULL GROUP BY mm.locationName ORDER BY cnt DESC")
    List<Object[]> findFavoritePlacesByPet(@Param("userId") UUID userId, @Param("petId") UUID petId);

    /** @deprecated 그룹 기반 쿼리(countDistinctVisitedPlacesByGroup)를 사용하세요. */
    @Query("SELECT COUNT(DISTINCT mm.locationName) FROM MemoryMoment mm WHERE mm.memory.user.id = :userId AND mm.locationName IS NOT NULL AND mm.memory.memoryDate BETWEEN :start AND :end")
    long countDistinctVisitedPlaces(@Param("userId") UUID userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    /** @deprecated 그룹 기반 쿼리를 사용하세요. */
    @Query("SELECT COUNT(DISTINCT mm.locationName) FROM MemoryMoment mm JOIN mm.memory m JOIN m.memoryDogs md WHERE m.user.id = :userId AND md.dog.id = :petId AND mm.locationName IS NOT NULL AND m.memoryDate BETWEEN :start AND :end")
    long countDistinctVisitedPlacesByPet(@Param("userId") UUID userId, @Param("petId") UUID petId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    /**
     * [목적] 기간 내 사용자 기억의 평균 에너지 수준을 수치로 환산한다.
     * [설명] HIGH=3, MEDIUM=2, LOW=1로 매핑하여 평균을 계산한다.
     *
     * @param userId 사용자 UUID
     * @param start  시작일
     * @param end    종료일
     * @return 평균 에너지 수치 (null 가능)
     */
    @Query("SELECT AVG(CASE mm.energyLevel WHEN 'HIGH' THEN 3 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 1 ELSE 0 END) FROM MemoryMoment mm WHERE mm.memory.user.id = :userId AND mm.memory.memoryDate BETWEEN :start AND :end")
    Double findAvgEnergyLevel(@Param("userId") UUID userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    /**
     * [목적] 사용자 기억에 등장한 고유 장소명 목록을 조회한다.
     *
     * @param userId 사용자 UUID
     * @return 고유 장소명 목록
     */
    @Query("SELECT DISTINCT mm.locationName FROM MemoryMoment mm WHERE mm.memory.user.id = :userId AND mm.locationName IS NOT NULL")
    List<String> findDistinctLocationNames(@Param("userId") UUID userId);

    /**
     * [목적] 장소별·에너지 수준별 통계를 조회한다. (지도 분석용)
     *
     * @param userId 사용자 UUID
     * @return [locationName, energyLevel, count] 형태의 Object[] 목록
     */
    @Query("SELECT mm.locationName, mm.energyLevel, COUNT(mm) FROM MemoryMoment mm WHERE mm.memory.user.id = :userId AND mm.locationName IS NOT NULL GROUP BY mm.locationName, mm.energyLevel")
    List<Object[]> findLocationEnergyStats(@Param("userId") UUID userId);

    /**
     * [목적] 기간 내 카테고리별 기억 분포를 조회한다. (대시보드용)
     *
     * @param userId 사용자 UUID
     * @param start  시작일
     * @param end    종료일
     * @return [category, count] 형태의 Object[] 목록
     */
    @Query("SELECT mm.category, COUNT(mm) FROM MemoryMoment mm WHERE mm.memory.user.id = :userId AND mm.memory.memoryDate BETWEEN :start AND :end GROUP BY mm.category")
    List<Object[]> findCategoryDistribution(@Param("userId") UUID userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    /**
     * [목적] 그룹 삭제 시 해당 그룹의 모든 기억 장소 데이터를 삭제한다.
     *
     * @param groupId 삭제할 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM MemoryMoment mm WHERE mm.memory.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
