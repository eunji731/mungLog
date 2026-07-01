package com.munglog.backend.domain.archive.service;

import com.munglog.backend.common.file.service.FileStorageService;
import com.munglog.backend.domain.archive.dto.ArchivePhotoResponse;
import com.munglog.backend.domain.archive.dto.ThemeTabResponse;
import com.munglog.backend.domain.family.service.FamilyGroupService;
import com.munglog.backend.domain.memory.domain.Photo;
import com.munglog.backend.domain.memory.domain.PhotoThemeTag;
import com.munglog.backend.domain.memory.repository.PhotoRepository;
import com.munglog.backend.domain.memory.repository.PhotoThemeTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 사진 아카이브 서비스.
 * AI가 분류한 테마 태그를 기반으로 사진을 조회하고 검색하는 비즈니스 로직을 담당하는 클래스.
 * 그룹 소속 여부를 확인하여 타 그룹의 데이터에 접근하지 못하도록 한다.
 * 주요 기능: 테마 탭 목록, 베스트 사진, 테마별 사진 조회, 태그 자동완성, 테마 검색
 */
@Service
@RequiredArgsConstructor
public class ArchiveService {

    private final PhotoThemeTagRepository photoThemeTagRepository;
    private final PhotoRepository photoRepository;
    private final FileStorageService fileStorageService;
    private final FamilyGroupService familyGroupService;

    /**
     * [목적] 그룹 내 사진에 붙은 테마 태그를 사용 빈도 순으로 조회한다.
     * [설명] 태그별 사진 수와 대표 사진 URL을 함께 반환한다.
     *        썸네일(300px)이 있으면 우선 사용하고 없으면 원본을 사용한다.
     *        그룹이 없으면 빈 목록을 반환한다.
     *
     * @param userId 요청 사용자 UUID
     * @return 테마 탭 응답 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<ThemeTabResponse> getThemes(UUID userId) {
        UUID groupId = familyGroupService.findGroupIdByUserId(userId).orElse(null);
        if (groupId == null) return List.of();
        return photoThemeTagRepository.findTopTagsByGroup(groupId).stream()
                .map(row -> {
                    String tag = (String) row[0];
                    long count = ((Number) row[1]).longValue();
                    List<PhotoThemeTag> photos = photoThemeTagRepository.findPhotosByTagAndGroup(groupId, tag);
                    String repUrl = photos.isEmpty() ? null
                            : resolveUrl(photos.get(0).getPhoto().getPathThumb300() != null
                            ? photos.get(0).getPhoto().getPathThumb300()
                            : photos.get(0).getPhoto().getPathOrigin());
                    return ThemeTabResponse.builder().tag(tag).count(count).representativePhotoUrl(repUrl).build();
                })
                .collect(Collectors.toList());
    }

    /**
     * [목적] 그룹 내 베스트(isBest=true) 사진 목록을 조회한다.
     * [설명] 각 사진에 붙은 테마 태그 목록도 함께 반환한다.
     *        그룹이 없으면 빈 목록을 반환한다.
     *
     * @param userId 요청 사용자 UUID
     * @return 베스트 사진 응답 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<ArchivePhotoResponse> getBestPhotos(UUID userId) {
        UUID groupId = familyGroupService.findGroupIdByUserId(userId).orElse(null);
        if (groupId == null) return List.of();
        return photoRepository.findBestPhotosByGroup(groupId).stream()
                .map(photo -> {
                    List<String> tags = photo.getThemeTags().stream()
                            .map(PhotoThemeTag::getTag).toList();
                    return ArchivePhotoResponse.from(photo, resolveUrl(photo.getPathThumb300() != null
                            ? photo.getPathThumb300() : photo.getPathOrigin()), tags);
                })
                .toList();
    }

    /**
     * [목적] 특정 테마 태그에 해당하는 사진 목록을 조회한다.
     * [설명] 그룹 내 사진 중 해당 태그가 붙은 것만 필터링하여 반환한다.
     *        그룹이 없으면 빈 목록을 반환한다.
     *
     * @param userId 요청 사용자 UUID
     * @param tag    조회할 테마 태그명
     * @return 해당 테마의 사진 응답 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<ArchivePhotoResponse> getPhotosByTheme(UUID userId, String tag) {
        UUID groupId = familyGroupService.findGroupIdByUserId(userId).orElse(null);
        if (groupId == null) return List.of();
        return photoThemeTagRepository.findPhotosByTagAndGroup(groupId, tag).stream()
                .map(pt -> {
                    Photo photo = pt.getPhoto();
                    List<String> tags = photo.getThemeTags().stream()
                            .map(PhotoThemeTag::getTag).toList();
                    return ArchivePhotoResponse.from(photo, resolveUrl(photo.getPathThumb300() != null
                            ? photo.getPathThumb300() : photo.getPathOrigin()), tags);
                })
                .toList();
    }

    /**
     * [목적] 접두어로 시작하는 태그 목록을 자동완성 용도로 제안한다.
     * [설명] 그룹 내 태그 중 prefix로 시작하는 것만 반환한다.
     *        그룹이 없으면 빈 목록을 반환한다.
     *
     * @param userId 요청 사용자 UUID
     * @param prefix 자동완성 검색 접두어
     * @return 매칭되는 태그 문자열 목록
     */
    @Transactional(readOnly = true)
    public List<String> suggestTags(UUID userId, String prefix) {
        UUID groupId = familyGroupService.findGroupIdByUserId(userId).orElse(null);
        if (groupId == null) return List.of();
        return photoThemeTagRepository.suggestTagsByGroup(groupId, prefix);
    }

    /**
     * [목적] 키워드가 포함된 테마 태그의 사진을 검색한다.
     * [설명] 태그명에 keyword가 포함된 모든 사진을 반환한다.
     *        그룹이 없으면 빈 목록을 반환한다.
     *
     * @param userId  요청 사용자 UUID
     * @param keyword 검색 키워드
     * @return 매칭되는 사진 응답 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<ArchivePhotoResponse> searchByTheme(UUID userId, String keyword) {
        UUID groupId = familyGroupService.findGroupIdByUserId(userId).orElse(null);
        if (groupId == null) return List.of();
        return photoThemeTagRepository.searchThemesByKeywordAndGroup(groupId, keyword).stream()
                .map(pt -> {
                    Photo photo = pt.getPhoto();
                    List<String> tags = photo.getThemeTags().stream()
                            .map(PhotoThemeTag::getTag).toList();
                    return ArchivePhotoResponse.from(photo, resolveUrl(photo.getPathThumb300() != null
                            ? photo.getPathThumb300() : photo.getPathOrigin()), tags);
                })
                .toList();
    }

    /**
     * [목적] 파일 경로를 외부 접근 가능한 URL로 변환한다.
     *
     * @param path 저장소 내 파일 경로
     * @return 접근 가능한 URL (path가 null이면 null 반환)
     */
    private String resolveUrl(String path) {
        return path != null ? fileStorageService.getFileUrl(path) : null;
    }
}
