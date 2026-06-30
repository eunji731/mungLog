package com.munglog.backend.domain.map.service;

import com.munglog.backend.common.file.service.FileStorageService;
import com.munglog.backend.domain.family.service.FamilyGroupService;
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
    private final FamilyGroupService familyGroupService;

    @Transactional(readOnly = true)
    public List<MapMemoryResponse> getMapMemories(UUID userId) {
        UUID groupId = familyGroupService.findGroupIdByUserId(userId).orElse(null);
        if (groupId == null) return List.of();
        return photoRepository.findMapMemoriesByGroup(groupId).stream()
                .map(this::toMemoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MapMarkerResponse> getMapMarkers(UUID userId) {
        UUID groupId = familyGroupService.findGroupIdByUserId(userId).orElse(null);
        if (groupId == null) return List.of();
        return photoRepository.findMapMarkersByGroup(groupId).stream()
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
        UUID groupId = familyGroupService.findGroupIdByUserId(userId).orElse(null);
        if (groupId == null) return List.of();
        return photoRepository.findDistinctAiTitlesByGroup(groupId);
    }

    @Transactional(readOnly = true)
    public List<MapMemoryResponse> searchMapMemories(UUID userId, String keyword) {
        UUID groupId = familyGroupService.findGroupIdByUserId(userId).orElse(null);
        if (groupId == null) return List.of();
        return photoRepository.findMapMemoriesByGroupAndKeyword(groupId, keyword).stream()
                .map(this::toMemoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MapMemoryResponse getMemoryDetail(UUID userId, UUID photoId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        return photoRepository.findById(photoId)
                .filter(p -> p.getMemory().getGroup() != null && p.getMemory().getGroup().getId().equals(groupId))
                .map(this::toMemoryResponse)
                .orElseThrow(() -> new IllegalArgumentException("사진 정보를 찾을 수 없습니다."));
    }

    private MapMemoryResponse toMemoryResponse(Photo p) {
        MapMemoryResponse.MemoryInfo momentInfo = null;
        if (p.getMoment() != null) {
            momentInfo = MapMemoryResponse.MemoryInfo.builder()
                    .id(p.getMoment().getId())
                    .category(p.getMoment().getCategory())
                    .aiTitle(p.getMoment().getAiTitle())
                    .locationName(p.getMoment().getLocationName())
                    .aiDiary(p.getMoment().getAiContent())
                    .build();
        }
        MapMemoryResponse.DailyLogInfo logInfo = MapMemoryResponse.DailyLogInfo.builder()
                .id(p.getMemory().getId())
                .dateKey(p.getMemory().getMemoryDate() != null ? p.getMemory().getMemoryDate().toString() : null)
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
