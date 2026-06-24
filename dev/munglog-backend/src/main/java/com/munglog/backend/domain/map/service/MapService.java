package com.munglog.backend.domain.map.service;

import com.munglog.backend.common.file.service.FileStorageService;
import com.munglog.backend.domain.map.dto.MapMarkerResponse;
import com.munglog.backend.domain.map.dto.MapMemoryResponse;
import com.munglog.backend.domain.memory.domain.Photo;
import com.munglog.backend.domain.memory.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MapService {

    private final PhotoRepository photoRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<MapMemoryResponse> getMapMemories(UUID userId) {
        return photoRepository.findMapMemories(userId).stream()
                .map(this::toMemoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MapMarkerResponse> getMapMarkers(UUID userId) {
        return photoRepository.findMapMarkers(userId).stream()
                .map(p -> MapMarkerResponse.builder()
                        .id(p.getId())
                        .lat(p.getGpsLat())
                        .lng(p.getGpsLng())
                        .thumb(resolveUrl(p.getPathThumb100() != null ? p.getPathThumb100() : p.getPathThumb300()))
                        .momentId(p.getMoment() != null ? p.getMoment().getId() : null)
                        .dateKey(p.getMemory().getMemoryDate() != null ? p.getMemory().getMemoryDate().toString() : null)
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> getSearchSuggestions(UUID userId) {
        return photoRepository.findDistinctAiTitles(userId);
    }

    @Transactional(readOnly = true)
    public List<MapMemoryResponse> searchMapMemories(UUID userId, String keyword) {
        return photoRepository.findMapMemoriesByKeyword(userId, keyword).stream()
                .map(this::toMemoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MapMemoryResponse getMemoryDetail(UUID userId, UUID memoryId) {
        return photoRepository.findFirstByMemory_IdAndGpsLatIsNotNull(memoryId)
                .map(this::toMemoryResponse)
                .orElseThrow(() -> new IllegalArgumentException("위치 정보가 없습니다."));
    }

    private MapMemoryResponse toMemoryResponse(Photo p) {
        MapMemoryResponse.MemoryInfo momentInfo = null;
        if (p.getMoment() != null) {
            momentInfo = MapMemoryResponse.MemoryInfo.builder()
                    .id(p.getMoment().getId())
                    .category(p.getMoment().getCategory())
                    .aiTitle(p.getMoment().getAiTitle())
                    .locationName(p.getMoment().getLocationName())
                    .build();
        }
        MapMemoryResponse.DailyLogInfo logInfo = MapMemoryResponse.DailyLogInfo.builder()
                .id(p.getMemory().getId())
                .memoryDate(p.getMemory().getMemoryDate() != null ? p.getMemory().getMemoryDate().toString() : null)
                .aiTitle(p.getMemory().getAiTitle())
                .build();

        return MapMemoryResponse.builder()
                .photoId(p.getId())
                .path(resolveUrl(p.getPathOrigin()))
                .takenAt(p.getTakenAt())
                .latitude(p.getGpsLat())
                .longitude(p.getGpsLng())
                .moment(momentInfo)
                .dailyLog(logInfo)
                .build();
    }

    private String resolveUrl(String path) {
        return path != null ? fileStorageService.getFileUrl(path) : null;
    }
}
