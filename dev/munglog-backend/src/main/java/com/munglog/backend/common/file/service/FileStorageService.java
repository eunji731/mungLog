package com.munglog.backend.common.file.service;

import com.munglog.backend.common.file.domain.ParentDomainType;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

public interface FileStorageService {

    String store(MultipartFile file, ParentDomainType parentType, UUID parentId);

    String storeFromStream(InputStream inputStream, String fileName, String contentType,
                           ParentDomainType parentType, UUID parentId);

    void delete(String storedPath);

    void deleteOrphans(List<String> allStoredPaths);

    InputStream getInputStream(String storedPath);

    String getFileUrl(String storedPath);

    String storeThumbnail(String storedPath, int size);
}
