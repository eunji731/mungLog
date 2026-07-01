package com.munglog.backend.domain.memory.repository;

import com.munglog.backend.domain.memory.domain.PhotoThemeTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * 사진 테마 태그 레포지토리.
 * PhotoThemeTag(사진에 붙은 AI 테마 태그) 엔티티의 DB 조회·삭제 쿼리를 정의하는 인터페이스.
 * 아카이브 기능에서 테마별 사진 분류와 태그 자동완성에 사용된다.
 */
public interface PhotoThemeTagRepository extends JpaRepository<PhotoThemeTag, UUID> {

    /**
     * [목적] 그룹 사진의 테마 태그를 사용 빈도 내림차순으로 조회한다. (아카이브 탭 목록용)
     *
     * @param groupId 가족 그룹 UUID
     * @return [tag, count] 형태의 Object[] 목록
     */
    @Query("SELECT pt.tag, COUNT(pt) as cnt FROM PhotoThemeTag pt WHERE pt.photo.memory.group.id = :groupId GROUP BY pt.tag ORDER BY cnt DESC")
    List<Object[]> findTopTagsByGroup(@Param("groupId") UUID groupId);

    /**
     * [목적] 그룹에서 특정 태그가 붙은 사진을 vibe 점수 내림차순으로 조회한다.
     *
     * @param groupId 가족 그룹 UUID
     * @param tag     검색할 테마 태그
     * @return 태그가 붙은 PhotoThemeTag 목록 (vibe 점수 내림차순)
     */
    @Query("SELECT pt FROM PhotoThemeTag pt WHERE pt.photo.memory.group.id = :groupId AND pt.tag = :tag ORDER BY pt.photo.vibeScore DESC")
    List<PhotoThemeTag> findPhotosByTagAndGroup(@Param("groupId") UUID groupId, @Param("tag") String tag);

    /**
     * [목적] 그룹 사진의 태그 중 prefix로 시작하는 고유 태그를 조회한다. (태그 자동완성용)
     *
     * @param groupId 가족 그룹 UUID
     * @param prefix  자동완성 접두사
     * @return prefix로 시작하는 고유 태그 목록
     */
    @Query("SELECT DISTINCT pt.tag FROM PhotoThemeTag pt WHERE pt.photo.memory.group.id = :groupId AND pt.tag LIKE :prefix%")
    List<String> suggestTagsByGroup(@Param("groupId") UUID groupId, @Param("prefix") String prefix);

    /**
     * [목적] 그룹 사진에서 키워드를 포함하는 태그를 검색한다.
     *
     * @param groupId 가족 그룹 UUID
     * @param keyword 검색 키워드
     * @return 키워드가 포함된 PhotoThemeTag 목록
     */
    @Query("SELECT DISTINCT pt FROM PhotoThemeTag pt JOIN pt.photo p WHERE p.memory.group.id = :groupId AND pt.tag LIKE %:keyword%")
    List<PhotoThemeTag> searchThemesByKeywordAndGroup(@Param("groupId") UUID groupId, @Param("keyword") String keyword);

    // ──────────────────────────────────────────────
    // 이하 하위 호환용 user-based 쿼리
    // ──────────────────────────────────────────────

    /** @deprecated 그룹 기반 쿼리(findTopTagsByGroup)를 사용하세요. */
    @Query("SELECT pt.tag, COUNT(pt) as cnt FROM PhotoThemeTag pt WHERE pt.photo.memory.user.id = :userId GROUP BY pt.tag ORDER BY cnt DESC")
    List<Object[]> findTopTags(@Param("userId") UUID userId);

    /** @deprecated 그룹 기반 쿼리(findPhotosByTagAndGroup)를 사용하세요. */
    @Query("SELECT pt FROM PhotoThemeTag pt WHERE pt.photo.memory.user.id = :userId AND pt.tag = :tag ORDER BY pt.photo.vibeScore DESC")
    List<PhotoThemeTag> findPhotosByTag(@Param("userId") UUID userId, @Param("tag") String tag);

    /** @deprecated 그룹 기반 쿼리를 사용하세요. */
    @Query("SELECT DISTINCT pt.tag FROM PhotoThemeTag pt WHERE pt.photo.memory.user.id = :userId AND pt.tag LIKE %:keyword%")
    List<String> searchPhotosByTagKeyword(@Param("userId") UUID userId, @Param("keyword") String keyword);

    /** @deprecated 그룹 기반 쿼리(suggestTagsByGroup)를 사용하세요. */
    @Query("SELECT DISTINCT pt.tag FROM PhotoThemeTag pt WHERE pt.photo.memory.user.id = :userId AND pt.tag LIKE :prefix%")
    List<String> suggestTags(@Param("userId") UUID userId, @Param("prefix") String prefix);

    /**
     * [목적] 특정 사진의 태그와 개수를 요약하여 조회한다.
     *
     * @param photoId 사진 UUID
     * @return [tag, count] 형태의 Object[] 목록
     */
    @Query("SELECT pt.tag, COUNT(pt) FROM PhotoThemeTag pt WHERE pt.photo.id = :photoId GROUP BY pt.tag")
    List<Object[]> findTagSummary(@Param("photoId") UUID photoId);

    /** @deprecated 그룹 기반 쿼리(searchThemesByKeywordAndGroup)를 사용하세요. */
    @Query("SELECT DISTINCT pt FROM PhotoThemeTag pt JOIN pt.photo p WHERE p.memory.user.id = :userId AND pt.tag LIKE %:keyword%")
    List<PhotoThemeTag> searchThemesByKeyword(@Param("userId") UUID userId, @Param("keyword") String keyword);

    /**
     * [목적] 그룹 삭제 시 해당 그룹 사진의 모든 테마 태그를 삭제한다.
     *
     * @param groupId 삭제할 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM PhotoThemeTag pt WHERE pt.photo.memory.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
