package com.munglog.backend.common.file.service;

import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.exception.FileStorageException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
public class S3FileStorageService implements FileStorageService {

    private final S3Client s3Client;

    @Value("${app.s3.bucket}")
    private String bucket;

    @Value("${app.s3.region}")
    private String region;

    @Override
    public String store(MultipartFile file, ParentDomainType parentType, UUID parentId) {
        try {
            String key = buildKey(parentType, parentId, getExtension(file.getOriginalFilename()));
            s3Client.putObject(PutObjectRequest.builder()
                            .bucket(bucket).key(key).contentType(file.getContentType()).build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return key;
        } catch (IOException e) {
            throw new FileStorageException("S3 업로드 실패", e);
        }
    }

    @Override
    public String storeFromStream(InputStream inputStream, String fileName, String contentType,
                                   ParentDomainType parentType, UUID parentId) {
        try {
            String key = buildKey(parentType, parentId, getExtension(fileName));
            byte[] bytes = inputStream.readAllBytes();
            s3Client.putObject(PutObjectRequest.builder()
                            .bucket(bucket).key(key).contentType(contentType).build(),
                    RequestBody.fromBytes(bytes));
            return key;
        } catch (IOException e) {
            throw new FileStorageException("S3 스트림 업로드 실패", e);
        }
    }

    @Override
    public void delete(String storedPath) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(storedPath).build());
        } catch (Exception e) {
            log.warn("S3 삭제 실패: {}", storedPath, e);
        }
    }

    @Override
    public void deleteOrphans(List<String> allStoredPaths) {
        // 구현 생략
    }

    @Override
    public InputStream getInputStream(String storedPath) {
        return s3Client.getObject(GetObjectRequest.builder().bucket(bucket).key(storedPath).build());
    }

    @Override
    public String getFileUrl(String storedPath) {
        if (storedPath == null) return null;
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + storedPath;
    }

    private String buildKey(ParentDomainType parentType, UUID parentId, String ext) {
        return "files/" + parentType.name().toLowerCase() + "/" + parentId + "/" + UUID.randomUUID() + ext;
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int idx = filename.lastIndexOf('.');
        return idx >= 0 ? filename.substring(idx) : "";
    }
}
