package com.munglog.backend.domain.memory.repository;

import com.munglog.backend.domain.memory.domain.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PhotoRepository extends JpaRepository<Photo, UUID> {

    @Query("SELECT p FROM Photo p WHERE p.memory.user.id = :userId AND p.gpsLat IS NOT NULL AND p.gpsLng IS NOT NULL ORDER BY p.takenAt DESC")
    List<Photo> findMapMemories(@Param("userId") UUID userId);

    @Query("SELECT p FROM Photo p WHERE p.memory.user.id = :userId AND (p.aiCaption LIKE %:keyword% OR p.memory.location LIKE %:keyword%) AND p.gpsLat IS NOT NULL ORDER BY p.takenAt DESC")
    List<Photo> findMapMemoriesByKeyword(@Param("userId") UUID userId, @Param("keyword") String keyword);

    @Query("SELECT p FROM Photo p WHERE p.memory.id = :memoryId AND p.gpsLat IS NOT NULL ORDER BY p.takenAt ASC")
    Optional<Photo> findFirstByMemory_IdAndGpsLatIsNotNull(@Param("memoryId") UUID memoryId);

    @Query("SELECT p FROM Photo p WHERE p.memory.user.id = :userId AND p.isBest = true ORDER BY p.vibeScore DESC")
    List<Photo> findBestPhotos(@Param("userId") UUID userId);

    @Query("SELECT COUNT(p) FROM Photo p WHERE p.memory.user.id = :userId AND p.isBest = true")
    long countBestPhotos(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT p.gpsSource FROM Photo p WHERE p.memory.user.id = :userId AND p.gpsLat IS NOT NULL")
    List<String> findDistinctLocations(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT p.aiCaption FROM Photo p WHERE p.memory.user.id = :userId AND p.aiCaption IS NOT NULL")
    List<String> findDistinctAiTitles(@Param("userId") UUID userId);

    @Query("SELECT p FROM Photo p WHERE p.memory.user.id = :userId AND p.gpsLat IS NOT NULL ORDER BY p.takenAt DESC")
    List<Photo> findMapMarkers(@Param("userId") UUID userId);
}
