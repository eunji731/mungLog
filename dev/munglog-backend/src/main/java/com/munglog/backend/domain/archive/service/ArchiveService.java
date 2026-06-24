package com.munglog.backend.domain.archive.service;

import com.munglog.backend.common.file.service.FileStorageService;
import com.munglog.backend.domain.archive.dto.ArchivePhotoResponse;
import com.munglog.backend.domain.archive.dto.ThemeTabResponse;
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

@Service
@RequiredArgsConstructor
public class ArchiveService {

    private final PhotoThemeTagRepository photoThemeTagRepository;
    private final PhotoRepository photoRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<ThemeTabResponse> getThemes(UUID userId) {
        return photoThemeTagRepository.findTopTags(userId).stream()
                .map(row -> {
                    String tag = (String) row[0];
                    long count = ((Number) row[1]).longValue();
                    List<PhotoThemeTag> photos = photoThemeTagRepository.findPhotosByTag(userId, tag);
                    String repUrl = photos.isEmpty() ? null
                            : resolveUrl(photos.get(0).getPhoto().getPathThumb300() != null
                            ? photos.get(0).getPhoto().getPathThumb300()
                            : photos.get(0).getPhoto().getPathOrigin());
                    return ThemeTabResponse.builder().tag(tag).count(count).representativePhotoUrl(repUrl).build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ArchivePhotoResponse> getBestPhotos(UUID userId) {
        return photoRepository.findBestPhotos(userId).stream()
                .map(photo -> {
                    List<String> tags = photo.getThemeTags().stream()
                            .map(PhotoThemeTag::getTag).toList();
                    return ArchivePhotoResponse.from(photo, resolveUrl(photo.getPathThumb300() != null
                            ? photo.getPathThumb300() : photo.getPathOrigin()), tags);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ArchivePhotoResponse> getPhotosByTheme(UUID userId, String tag) {
        return photoThemeTagRepository.findPhotosByTag(userId, tag).stream()
                .map(pt -> {
                    Photo photo = pt.getPhoto();
                    List<String> tags = photo.getThemeTags().stream()
                            .map(PhotoThemeTag::getTag).toList();
                    return ArchivePhotoResponse.from(photo, resolveUrl(photo.getPathThumb300() != null
                            ? photo.getPathThumb300() : photo.getPathOrigin()), tags);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> suggestTags(UUID userId, String prefix) {
        return photoThemeTagRepository.suggestTags(userId, prefix);
    }

    @Transactional(readOnly = true)
    public List<ArchivePhotoResponse> searchByTheme(UUID userId, String keyword) {
        return photoThemeTagRepository.searchThemesByKeyword(userId, keyword).stream()
                .map(pt -> {
                    Photo photo = pt.getPhoto();
                    List<String> tags = photo.getThemeTags().stream()
                            .map(PhotoThemeTag::getTag).toList();
                    return ArchivePhotoResponse.from(photo, resolveUrl(photo.getPathThumb300() != null
                            ? photo.getPathThumb300() : photo.getPathOrigin()), tags);
                })
                .toList();
    }

    private String resolveUrl(String path) {
        return path != null ? fileStorageService.getFileUrl(path) : null;
    }
}
