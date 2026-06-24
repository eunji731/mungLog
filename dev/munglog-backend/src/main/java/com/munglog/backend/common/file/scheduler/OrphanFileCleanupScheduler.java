package com.munglog.backend.common.file.scheduler;

import com.munglog.backend.common.file.repository.AttachedFileRepository;
import com.munglog.backend.common.file.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrphanFileCleanupScheduler {

    private final AttachedFileRepository attachedFileRepository;
    private final FileStorageService fileStorageService;

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
