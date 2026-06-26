package com.munglog.backend.common.file.service;

import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.exception.FileStorageException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import net.coobird.thumbnailator.Thumbnails;

import java.io.*;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements FileStorageService {

    @Value("${app.upload.base-path}")
    private String basePath;

    @Override
    public String store(MultipartFile file, ParentDomainType parentType, UUID parentId) {
        try {
            String ext = getExtension(file.getOriginalFilename());
            String relative = buildRelativePath(parentType, parentId, ext);
            Path target = Paths.get(basePath, "files", relative);
            Files.createDirectories(target.getParent());
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return relative;
        } catch (IOException e) {
            throw new FileStorageException("파일 저장 실패: " + file.getOriginalFilename(), e);
        }
    }

    @Override
    public String storeFromStream(InputStream inputStream, String fileName, String contentType,
                                   ParentDomainType parentType, UUID parentId) {
        try {
            String ext = getExtension(fileName);
            String relative = buildRelativePath(parentType, parentId, ext);
            Path target = Paths.get(basePath, "files", relative);
            Files.createDirectories(target.getParent());
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            return relative;
        } catch (IOException e) {
            throw new FileStorageException("스트림에서 파일 저장 실패", e);
        }
    }

    @Override
    public void delete(String storedPath) {
        try {
            Path target = Paths.get(basePath, "files", storedPath);
            Files.deleteIfExists(target);
        } catch (IOException e) {
            log.warn("파일 삭제 실패: {}", storedPath, e);
        }
    }

    @Override
    public void deleteOrphans(List<String> allStoredPaths) {
        // 구현 생략 (스케줄러에서 사용)
    }

    @Override
    public InputStream getInputStream(String storedPath) {
        try {
            Path target = Paths.get(basePath, "files", storedPath);
            return Files.newInputStream(target);
        } catch (IOException e) {
            throw new FileStorageException("파일 읽기 실패: " + storedPath, e);
        }
    }

    @Override
    public String getFileUrl(String storedPath) {
        if (storedPath == null) return null;
        return "/files/" + storedPath;
    }

    @Override
    public String storeThumbnail(String storedPath, int size) {
        try {
            Path sourcePath = Paths.get(basePath, "files", storedPath);
            if (!Files.exists(sourcePath)) return null;

            int lastSlash = storedPath.lastIndexOf('/');
            String dir = lastSlash >= 0 ? storedPath.substring(0, lastSlash) : "";
            String filename = lastSlash >= 0 ? storedPath.substring(lastSlash + 1) : storedPath;
            String thumbRelative = (dir.isEmpty() ? "" : dir + "/") + "thumb" + size + "_" + filename;

            Path targetPath = Paths.get(basePath, "files", thumbRelative);
            Files.createDirectories(targetPath.getParent());

            Thumbnails.of(sourcePath.toFile())
                    .size(size, size)
                    .keepAspectRatio(true)
                    .toFile(targetPath.toFile());

            return thumbRelative;
        } catch (IOException e) {
            log.warn("썸네일 생성 실패 ({}px): {}", size, storedPath, e);
            return null;
        }
    }

    private String buildRelativePath(ParentDomainType parentType, UUID parentId, String ext) {
        return parentType.name().toLowerCase() + "/" + parentId + "/" + UUID.randomUUID() + ext;
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int idx = filename.lastIndexOf('.');
        return idx >= 0 ? filename.substring(idx) : "";
    }
}
