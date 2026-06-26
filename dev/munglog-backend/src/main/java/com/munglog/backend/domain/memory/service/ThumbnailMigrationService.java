package com.munglog.backend.domain.memory.service;

import com.munglog.backend.common.file.service.FileStorageService;
import com.munglog.backend.domain.memory.domain.Photo;
import com.munglog.backend.domain.memory.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ThumbnailMigrationService {

    private final PhotoRepository photoRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public MigrationResult migrate() {
        List<Photo> photos = photoRepository.findPhotosWithoutThumbnails();
        int success = 0;
        int failure = 0;

        for (Photo photo : photos) {
            try {
                String thumb100 = fileStorageService.storeThumbnail(photo.getPathOrigin(), 100);
                String thumb300 = fileStorageService.storeThumbnail(photo.getPathOrigin(), 300);
                photo.updateThumbs(thumb100, thumb300);
                success++;
            } catch (Exception e) {
                log.warn("썸네일 마이그레이션 실패 - photoId={}: {}", photo.getId(), e.getMessage());
                failure++;
            }
        }

        log.info("썸네일 마이그레이션 완료 - 성공: {}, 실패: {}, 전체: {}", success, failure, photos.size());
        return new MigrationResult(photos.size(), success, failure);
    }

    public record MigrationResult(int total, int success, int failure) {}
}
