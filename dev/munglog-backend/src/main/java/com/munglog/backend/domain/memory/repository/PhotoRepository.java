package com.munglog.backend.domain.memory.repository;

import com.munglog.backend.domain.memory.domain.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 사진(Photo) 레포지토리.
 * Photo 엔티티의 DB 조회·삭제 쿼리를 정의하는 인터페이스.
 * 지도 기능, 아카이브, 대시보드 분석에서 사진 데이터를 조회한다.
 */
public interface PhotoRepository extends JpaRepository<Photo, UUID> {

    /**
     * [목적] 그룹의 GPS 좌표가 있는 사진 목록을 최신순으로 조회한다. (지도 기억 표시용)
     *
     * @param groupId 가족 그룹 UUID
     * @return GPS 정보가 있는 사진 목록 (촬영일 내림차순)
     */
    @Query("SELECT p FROM Photo p WHERE p.memory.group.id = :groupId AND p.gpsLat IS NOT NULL AND p.gpsLng IS NOT NULL ORDER BY p.takenAt DESC")
    List<Photo> findMapMemoriesByGroup(@Param("groupId") UUID groupId);

    /**
     * [목적] 그룹의 GPS 사진 중 키워드와 일치하는 사진을 조회한다. (지도 검색용)
     *
     * @param groupId 가족 그룹 UUID
     * @param keyword 검색 키워드
     * @return 키워드가 매칭된 GPS 사진 목록
     */
    @Query("SELECT p FROM Photo p LEFT JOIN p.moment m WHERE p.memory.group.id = :groupId AND p.gpsLat IS NOT NULL AND (" +
           "p.aiCaption LIKE %:keyword% OR p.memory.location LIKE %:keyword% OR " +
           "p.memory.aiTitle LIKE %:keyword% OR m.locationName LIKE %:keyword% OR m.aiTitle LIKE %:keyword%" +
           ") ORDER BY p.takenAt DESC")
    List<Photo> findMapMemoriesByGroupAndKeyword(@Param("groupId") UUID groupId, @Param("keyword") String keyword);

    /**
     * [목적] 그룹의 GPS 좌표가 있는 사진만 조회한다. (지도 마커 표시용)
     *
     * @param groupId 가족 그룹 UUID
     * @return GPS 사진 목록 (촬영일 내림차순)
     */
    @Query("SELECT p FROM Photo p WHERE p.memory.group.id = :groupId AND p.gpsLat IS NOT NULL ORDER BY p.takenAt DESC")
    List<Photo> findMapMarkersByGroup(@Param("groupId") UUID groupId);

    /**
     * [목적] 그룹의 베스트 사진을 진동(vibe) 점수 내림차순으로 조회한다.
     *
     * @param groupId 가족 그룹 UUID
     * @return isBest=true인 사진 목록 (vibe 점수 내림차순)
     */
    @Query("SELECT p FROM Photo p WHERE p.memory.group.id = :groupId AND p.isBest = true ORDER BY p.vibeScore DESC")
    List<Photo> findBestPhotosByGroup(@Param("groupId") UUID groupId);

    /**
     * [목적] 특정 반려동물이 포함된 그룹의 베스트 사진을 조회한다.
     *
     * @param groupId 가족 그룹 UUID
     * @param petId   반려동물 UUID
     * @return 반려동물 태그 + isBest=true 사진 목록
     */
    @Query("SELECT p FROM Photo p JOIN p.memory m JOIN m.memoryDogs md WHERE m.group.id = :groupId AND md.dog.id = :petId AND p.isBest = true ORDER BY p.vibeScore DESC")
    List<Photo> findBestPhotosByGroupAndPet(@Param("groupId") UUID groupId, @Param("petId") UUID petId);

    /**
     * [목적] 그룹 사진의 고유 AI 캡션 목록을 조회한다. (아카이브 테마 태그용)
     *
     * @param groupId 가족 그룹 UUID
     * @return 고유 AI 캡션 목록
     */
    @Query("SELECT DISTINCT p.aiCaption FROM Photo p WHERE p.memory.group.id = :groupId AND p.aiCaption IS NOT NULL")
    List<String> findDistinctAiTitlesByGroup(@Param("groupId") UUID groupId);

    // ──────────────────────────────────────────────
    // 이하 하위 호환용 user-based 쿼리
    // ──────────────────────────────────────────────

    /** @deprecated 그룹 기반 쿼리(findMapMemoriesByGroup)를 사용하세요. */
    @Query("SELECT p FROM Photo p WHERE p.memory.user.id = :userId AND p.gpsLat IS NOT NULL AND p.gpsLng IS NOT NULL ORDER BY p.takenAt DESC")
    List<Photo> findMapMemories(@Param("userId") UUID userId);

    /** @deprecated 그룹 기반 쿼리(findMapMemoriesByGroupAndKeyword)를 사용하세요. */
    @Query("SELECT p FROM Photo p LEFT JOIN p.moment m WHERE p.memory.user.id = :userId AND p.gpsLat IS NOT NULL AND (" +
           "p.aiCaption LIKE %:keyword% OR p.memory.location LIKE %:keyword% OR " +
           "p.memory.aiTitle LIKE %:keyword% OR m.locationName LIKE %:keyword% OR m.aiTitle LIKE %:keyword%" +
           ") ORDER BY p.takenAt DESC")
    List<Photo> findMapMemoriesByKeyword(@Param("userId") UUID userId, @Param("keyword") String keyword);

    /**
     * [목적] 특정 기억에서 GPS가 있는 첫 번째 사진을 조회한다. (대표 위치 설정용)
     *
     * @param memoryId 기억 UUID
     * @return GPS 정보가 있는 첫 번째 사진 Optional
     */
    @Query("SELECT p FROM Photo p WHERE p.memory.id = :memoryId AND p.gpsLat IS NOT NULL ORDER BY p.takenAt ASC")
    Optional<Photo> findFirstByMemory_IdAndGpsLatIsNotNull(@Param("memoryId") UUID memoryId);

    /**
     * [목적] 특정 moment에서 GPS가 있는 첫 번째 사진을 조회한다.
     *
     * @param momentId moment UUID
     * @return GPS 정보가 있는 첫 번째 사진 Optional
     */
    @Query("SELECT p FROM Photo p WHERE p.moment.id = :momentId AND p.gpsLat IS NOT NULL ORDER BY p.takenAt ASC")
    Optional<Photo> findFirstByMoment_IdAndGpsLatIsNotNull(@Param("momentId") UUID momentId);

    /** @deprecated 그룹 기반 쿼리(findBestPhotosByGroup)를 사용하세요. */
    @Query("SELECT p FROM Photo p WHERE p.memory.user.id = :userId AND p.isBest = true ORDER BY p.vibeScore DESC")
    List<Photo> findBestPhotos(@Param("userId") UUID userId);

    /** @deprecated 그룹 기반 쿼리(findBestPhotosByGroupAndPet)를 사용하세요. */
    @Query("SELECT p FROM Photo p JOIN p.memory m JOIN m.memoryDogs md WHERE m.user.id = :userId AND md.dog.id = :petId AND p.isBest = true ORDER BY p.vibeScore DESC")
    List<Photo> findBestPhotosByPet(@Param("userId") UUID userId, @Param("petId") UUID petId);

    /**
     * [목적] 사용자의 베스트 사진 총 개수를 반환한다.
     *
     * @param userId 사용자 UUID
     * @return 베스트 사진 수
     */
    @Query("SELECT COUNT(p) FROM Photo p WHERE p.memory.user.id = :userId AND p.isBest = true")
    long countBestPhotos(@Param("userId") UUID userId);

    /**
     * [목적] 사용자 사진의 고유 GPS 소스 목록을 조회한다.
     *
     * @param userId 사용자 UUID
     * @return GPS 소스 목록 (예: "exif", "manual")
     */
    @Query("SELECT DISTINCT p.gpsSource FROM Photo p WHERE p.memory.user.id = :userId AND p.gpsLat IS NOT NULL")
    List<String> findDistinctLocations(@Param("userId") UUID userId);

    /**
     * [목적] 사용자 사진의 고유 AI 캡션 목록을 조회한다.
     *
     * @param userId 사용자 UUID
     * @return AI 캡션 목록
     */
    @Query("SELECT DISTINCT p.aiCaption FROM Photo p WHERE p.memory.user.id = :userId AND p.aiCaption IS NOT NULL")
    List<String> findDistinctAiTitles(@Param("userId") UUID userId);

    /**
     * [목적] 사용자의 GPS 사진 목록을 조회한다. (지도 마커용 레거시)
     *
     * @param userId 사용자 UUID
     * @return GPS 사진 목록 (최신순)
     */
    @Query("SELECT p FROM Photo p WHERE p.memory.user.id = :userId AND p.gpsLat IS NOT NULL ORDER BY p.takenAt DESC")
    List<Photo> findMapMarkers(@Param("userId") UUID userId);

    /**
     * [목적] 썸네일 경로가 없는 사진 목록을 조회한다. (썸네일 마이그레이션용)
     *
     * @return 썸네일 미생성 사진 목록
     */
    @Query("SELECT p FROM Photo p WHERE p.pathThumb100 IS NULL AND p.pathOrigin IS NOT NULL")
    List<Photo> findPhotosWithoutThumbnails();

    /**
     * [목적] 그룹 삭제 시 해당 그룹의 모든 사진을 삭제한다.
     *
     * @param groupId 삭제할 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM Photo p WHERE p.memory.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
