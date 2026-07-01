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

/**
 * 로컬 파일 시스템을 사용하는 파일 저장 서비스 구현체.
 * application.yml에서 app.storage.type=local(기본값)로 설정 시 활성화된다.
 * 파일은 {app.upload.base-path}/files/{parentType}/{parentId}/{uuid}.{ext} 경로에 저장된다.
 * WebConfig에서 /files/** URL로 접근 가능하도록 정적 리소스가 매핑된다.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements FileStorageService {

    /** 업로드 파일의 로컬 저장 기본 경로 */
    @Value("${app.upload.base-path}")
    private String basePath;

    /**
     * [목적] MultipartFile을 로컬 파일 시스템에 저장한다.
     *
     * @param file       업로드된 파일
     * @param parentType 도메인 타입 (경로 구성에 사용)
     * @param parentId   부모 엔티티 UUID (경로 구성에 사용)
     * @return 저장된 파일의 상대 경로 (basePath 기준)
     * @throws FileStorageException 파일 저장 실패 시
     */
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

    /**
     * [목적] InputStream으로부터 파일을 로컬에 저장한다.
     *
     * @param inputStream 저장할 데이터 스트림
     * @param fileName    원본 파일명 (확장자 추출용)
     * @param contentType MIME 타입
     * @param parentType  도메인 타입
     * @param parentId    부모 엔티티 UUID
     * @return 저장된 파일의 상대 경로
     * @throws FileStorageException 저장 실패 시
     */
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

    /**
     * [목적] 로컬 파일 시스템에서 파일을 삭제한다.
     * [설명] 파일이 없으면 예외 없이 무시하며, 삭제 실패는 경고 로그만 남긴다.
     *
     * @param storedPath 삭제할 파일의 상대 경로
     */
    @Override
    public void delete(String storedPath) {
        try {
            Path target = Paths.get(basePath, "files", storedPath);
            Files.deleteIfExists(target);
        } catch (IOException e) {
            log.warn("파일 삭제 실패: {}", storedPath, e);
        }
    }

    /**
     * [목적] 고아 파일 정리 (로컬 환경에서는 미구현).
     * [설명] 로컬 환경에서는 고아 파일 정리 로직을 별도로 구현하지 않는다.
     *
     * @param allStoredPaths DB에 등록된 모든 경로 목록
     */
    @Override
    public void deleteOrphans(List<String> allStoredPaths) {
        // 구현 생략 (스케줄러에서 사용)
    }

    /**
     * [목적] 로컬 파일 시스템에서 파일 InputStream을 반환한다.
     *
     * @param storedPath 읽을 파일의 상대 경로
     * @return 파일 InputStream
     * @throws FileStorageException 파일 읽기 실패 시
     */
    @Override
    public InputStream getInputStream(String storedPath) {
        try {
            Path target = Paths.get(basePath, "files", storedPath);
            return Files.newInputStream(target);
        } catch (IOException e) {
            throw new FileStorageException("파일 읽기 실패: " + storedPath, e);
        }
    }

    /**
     * [목적] 로컬 파일의 HTTP 접근 URL을 생성한다.
     * [설명] WebConfig에서 /files/** → basePath/files/ 로 매핑되어 있으므로
     *        /files/{storedPath} 형태의 URL을 반환한다.
     *
     * @param storedPath 파일의 상대 경로
     * @return HTTP 접근 URL (null이면 null 반환)
     */
    @Override
    public String getFileUrl(String storedPath) {
        if (storedPath == null) return null;
        return "/files/" + storedPath;
    }

    /**
     * [목적] 원본 파일로부터 지정 크기의 썸네일을 생성하여 저장한다.
     * [설명] Thumbnailator 라이브러리를 사용하며, 가로세로 비율을 유지한다.
     *        썸네일 경로는 원본과 같은 디렉토리에 "thumb{size}_" 접두사를 붙인다.
     *
     * @param storedPath 원본 파일의 상대 경로
     * @param size       썸네일 픽셀 크기 (정방형 기준)
     * @return 생성된 썸네일의 상대 경로 (실패 시 null)
     */
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

    /**
     * [목적] 도메인 타입, 부모 ID, 확장자로 고유한 저장 경로를 생성한다.
     * [설명] 예: pet_profile/550e8400-e29b-41d4-a716-446655440000/a1b2c3d4.jpg
     *
     * @param parentType 도메인 타입
     * @param parentId   부모 엔티티 UUID
     * @param ext        파일 확장자 (예: .jpg)
     * @return 생성된 상대 경로 문자열
     */
    private String buildRelativePath(ParentDomainType parentType, UUID parentId, String ext) {
        return parentType.name().toLowerCase() + "/" + parentId + "/" + UUID.randomUUID() + ext;
    }

    /**
     * [목적] 파일명에서 확장자를 추출한다.
     *
     * @param filename 파일명 (null 허용)
     * @return 확장자 문자열 (예: ".jpg"), 없으면 빈 문자열
     */
    private String getExtension(String filename) {
        if (filename == null) return "";
        int idx = filename.lastIndexOf('.');
        return idx >= 0 ? filename.substring(idx) : "";
    }
}
