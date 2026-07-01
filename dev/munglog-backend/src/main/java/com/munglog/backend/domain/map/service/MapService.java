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

/**
 * 지도 기능 서비스.
 * GPS 좌표가 있는 사진을 기반으로 지도 표시에 필요한 데이터를 처리하는 클래스.
 * 주요 기능: 지도 추억 조회, 마커 생성, 키워드 검색, 자동완성 제공
 */
@Service
@RequiredArgsConstructor
public class MapService {

    private final PhotoRepository photoRepository;
    private final FileStorageService fileStorageService;
    private final FamilyGroupService familyGroupService;

    /**
     * [목적] 사용자의 그룹에 속한 GPS 정보가 있는 추억 전체를 조회
     * [설명] 사용자의 가족 그룹 ID를 조회한 뒤, 해당 그룹에서 GPS 좌표가 존재하는 사진 목록을 반환한다.
     *        그룹이 없으면 빈 목록을 반환하여 예외 발생을 방지한다.
     *
     * @param userId 현재 로그인한 사용자의 UUID
     * @return GPS 좌표가 있는 추억 목록, 그룹이 없으면 빈 목록
     */
    @Transactional(readOnly = true)
    public List<MapMemoryResponse> getMapMemories(UUID userId) {
        UUID groupId = familyGroupService.findGroupIdByUserId(userId).orElse(null);
        if (groupId == null) return List.of();
        return photoRepository.findMapMemoriesByGroup(groupId).stream()
                .map(this::toMemoryResponse)
                .toList();
    }

    /**
     * [목적] 지도 위에 표시할 경량 마커 데이터 목록을 조회
     * [설명] 사진별 GPS 좌표와 썸네일 URL만 포함된 마커 정보를 반환한다.
     *        100px 썸네일이 없으면 300px 썸네일을 대신 사용한다.
     *
     * @param userId 현재 로그인한 사용자의 UUID
     * @return 지도 마커 목록, 그룹이 없으면 빈 목록
     */
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

    /**
     * [목적] 검색창 자동완성에 사용할 키워드 후보 목록을 반환
     * [설명] 그룹 내 사진의 AI 캡션을 중복 없이 수집하여 자동완성 후보로 제공한다.
     *
     * @param userId 현재 로그인한 사용자의 UUID
     * @return 중복 제거된 AI 캡션 문자열 목록, 그룹이 없으면 빈 목록
     */
    @Transactional(readOnly = true)
    public List<String> getSearchSuggestions(UUID userId) {
        UUID groupId = familyGroupService.findGroupIdByUserId(userId).orElse(null);
        if (groupId == null) return List.of();
        return photoRepository.findDistinctAiTitlesByGroup(groupId);
    }

    /**
     * [목적] 키워드로 그룹 내 추억을 검색하여 지도에 표시
     * [설명] AI 캡션, 위치명, 일지 제목 등 다양한 필드에서 키워드를 검색한다.
     *        결과는 GPS 좌표가 있는 사진만 포함된다.
     *
     * @param userId  현재 로그인한 사용자의 UUID
     * @param keyword 검색할 키워드
     * @return 키워드 매칭 추억 목록, 그룹이 없으면 빈 목록
     */
    @Transactional(readOnly = true)
    public List<MapMemoryResponse> searchMapMemories(UUID userId, String keyword) {
        UUID groupId = familyGroupService.findGroupIdByUserId(userId).orElse(null);
        if (groupId == null) return List.of();
        return photoRepository.findMapMemoriesByGroupAndKeyword(groupId, keyword).stream()
                .map(this::toMemoryResponse)
                .toList();
    }

    /**
     * [목적] 특정 사진(추억)의 지도 상세 정보를 조회
     * [설명] photoId로 사진을 조회하고 해당 그룹 소속 여부를 검증한 뒤 상세 정보를 반환한다.
     *
     * @param userId  현재 로그인한 사용자의 UUID
     * @param photoId 조회할 사진의 UUID
     * @return 사진의 GPS 및 AI 분석 상세 정보
     * @throws IllegalArgumentException 사진이 존재하지 않거나 접근 권한이 없는 경우
     */
    @Transactional(readOnly = true)
    public MapMemoryResponse getMemoryDetail(UUID userId, UUID photoId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        return photoRepository.findById(photoId)
                .filter(p -> p.getMemory().getGroup() != null && p.getMemory().getGroup().getId().equals(groupId))
                .map(this::toMemoryResponse)
                .orElseThrow(() -> new IllegalArgumentException("사진 정보를 찾을 수 없습니다."));
    }

    /**
     * [목적] Photo 엔티티를 MapMemoryResponse DTO로 변환
     * [설명] 사진에 연결된 순간(Moment)과 일지(Memory) 정보를 함께 조합하여 응답 DTO를 생성한다.
     *        순간 정보가 없어도 일지 기본 정보는 항상 포함된다.
     *
     * @param p 변환할 Photo 엔티티
     * @return 변환된 MapMemoryResponse DTO
     */
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

    /**
     * [목적] 파일 경로를 접근 가능한 URL로 변환
     * [설명] FileStorageService를 통해 저장 경로를 실제 접근 URL로 변환한다.
     *        경로가 null이면 null을 반환하여 NPE를 방지한다.
     *
     * @param path 변환할 파일 경로
     * @return 접근 가능한 파일 URL, path가 null이면 null
     */
    private String resolveUrl(String path) {
        return path != null ? fileStorageService.getFileUrl(path) : null;
    }
}
