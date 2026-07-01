package com.munglog.backend.common.file.scheduler;

import com.munglog.backend.common.file.repository.AttachedFileRepository;
import com.munglog.backend.common.file.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 고아 파일(DB에는 없지만 스토리지에 남아있는 파일)을 주기적으로 정리하는 스케줄러.
 * 매일 새벽 3시에 실행되어 불필요한 스토리지 공간 낭비를 방지한다.
 * DB에 등록된 모든 파일 경로를 조회한 뒤 FileStorageService에 정리를 위임한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrphanFileCleanupScheduler {

    private final AttachedFileRepository attachedFileRepository;
    private final FileStorageService fileStorageService;

    /**
     * [목적] 매일 새벽 3시에 고아 파일을 스토리지에서 삭제한다.
     * [설명] DB의 attached_files 테이블에서 모든 storedPath를 수집하여
     *        FileStorageService.deleteOrphans()에 전달하고,
     *        스토리지에만 존재하는 파일(고아 파일)을 삭제하도록 한다.
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanup() {
        List<String> allPaths = attachedFileRepository.findAll()
                .stream()
                .map(af -> af.getStoredPath())
                .toList();
        fileStorageService.deleteOrphans(allPaths);
        log.info("고아 파일 정리 완료");
    }
}
