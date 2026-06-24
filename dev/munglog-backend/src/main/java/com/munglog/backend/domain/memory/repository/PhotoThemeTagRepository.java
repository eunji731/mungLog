package com.munglog.backend.domain.memory.repository;

import com.munglog.backend.domain.memory.domain.PhotoThemeTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PhotoThemeTagRepository extends JpaRepository<PhotoThemeTag, UUID> {

    @Query("SELECT pt.tag, COUNT(pt) as cnt FROM PhotoThemeTag pt WHERE pt.photo.memory.user.id = :userId GROUP BY pt.tag ORDER BY cnt DESC")
    List<Object[]> findTopTags(@Param("userId") UUID userId);

    @Query("SELECT pt FROM PhotoThemeTag pt WHERE pt.photo.memory.user.id = :userId AND pt.tag = :tag ORDER BY pt.photo.vibeScore DESC")
    List<PhotoThemeTag> findPhotosByTag(@Param("userId") UUID userId, @Param("tag") String tag);

    @Query("SELECT DISTINCT pt.tag FROM PhotoThemeTag pt WHERE pt.photo.memory.user.id = :userId AND pt.tag LIKE %:keyword%")
    List<String> searchPhotosByTagKeyword(@Param("userId") UUID userId, @Param("keyword") String keyword);

    @Query("SELECT DISTINCT pt.tag FROM PhotoThemeTag pt WHERE pt.photo.memory.user.id = :userId AND pt.tag LIKE :prefix%")
    List<String> suggestTags(@Param("userId") UUID userId, @Param("prefix") String prefix);

    @Query("SELECT pt.tag, COUNT(pt) FROM PhotoThemeTag pt WHERE pt.photo.id = :photoId GROUP BY pt.tag")
    List<Object[]> findTagSummary(@Param("photoId") UUID photoId);

    @Query("SELECT DISTINCT pt FROM PhotoThemeTag pt JOIN pt.photo p WHERE p.memory.user.id = :userId AND pt.tag LIKE %:keyword%")
    List<PhotoThemeTag> searchThemesByKeyword(@Param("userId") UUID userId, @Param("keyword") String keyword);
}
