package com.munglog.backend.domain.memory.service;

import com.munglog.backend.common.file.service.FileStorageService;
import com.munglog.backend.domain.memory.domain.Photo;
import com.munglog.backend.domain.memory.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 사진 썸네일 마이그레이션 서비스.
 * 기존에 썸네일 경로(pathThumb100)가 없는 사진들에 대해
 * 원본 이미지로부터 100px·300px 썸네일을 생성하고 경로를 저장하는 서비스 클래스.
 * 관리자 API를 통해 수동으로 실행한다.
 * 주요 기능: 미생성 썸네일 일괄 생성, 결과 집계
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ThumbnailMigrationService {

    private final PhotoRepository photoRepository;
    private final FileStorageService fileStorageService;

    /**
     * [목적] 썸네일이 없는 사진 전체에 대해 썸네일을 생성한다.
     * [설명] pathThumb100이 null이고 pathOrigin이 있는 사진을 조회하여
     *        100px·300px 썸네일을 각각 생성하고 photo 엔티티에 저장한다.
     *        개별 사진 실패는 로그만 남기고 나머지 처리를 계속한다.
     *
     * @return 마이그레이션 결과 (전체·성공·실패 수)
     */
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

    /**
     * 마이그레이션 결과를 담는 레코드.
     *
     * @param total   처리 대상 전체 사진 수
     * @param success 썸네일 생성 성공 수
     * @param failure 썸네일 생성 실패 수
     */
    public record MigrationResult(int total, int success, int failure) {}
}
