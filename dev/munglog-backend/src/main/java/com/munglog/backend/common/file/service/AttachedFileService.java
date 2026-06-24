package com.munglog.backend.common.file.service;

import com.munglog.backend.common.file.domain.AttachedFile;
import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.common.file.dto.StoredFileInfo;
import com.munglog.backend.common.file.repository.AttachedFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class AttachedFileService {

    private final AttachedFileRepository attachedFileRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public List<FileResponse> saveAll(ParentDomainType parentType, UUID parentId, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) return List.of();
        List<FileResponse> result = new ArrayList<>();
        int order = 0;
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;
            String storedPath = fileStorageService.store(file, parentType, parentId);
            AttachedFile af = attachedFileRepository.save(AttachedFile.builder()
                    .parentType(parentType)
                    .parentId(parentId)
                    .originalName(file.getOriginalFilename())
                    .storedPath(storedPath)
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .sortOrder(order++)
                    .build());
            result.add(FileResponse.from(af, fileStorageService.getFileUrl(storedPath)));
        }
        return result;
    }

    @Transactional
    public List<FileResponse> syncFiles(ParentDomainType parentType, UUID parentId,
                                        List<UUID> deletedIds, List<MultipartFile> newFiles) {
        if (deletedIds != null && !deletedIds.isEmpty()) {
            List<AttachedFile> toDelete = attachedFileRepository
                    .findByIdInAndParentTypeAndParentId(deletedIds, parentType, parentId);
            for (AttachedFile af : toDelete) {
                fileStorageService.delete(af.getStoredPath());
                attachedFileRepository.delete(af);
            }
        }
        saveAll(parentType, parentId, newFiles);
        return getFiles(parentType, parentId);
    }

    @Transactional
    public void deleteAllByParent(ParentDomainType parentType, UUID parentId) {
        List<AttachedFile> files = attachedFileRepository.findByParentTypeAndParentId(parentType, parentId);
        for (AttachedFile af : files) {
            fileStorageService.delete(af.getStoredPath());
        }
        attachedFileRepository.deleteAll(files);
    }

    @Transactional
    public List<AttachedFile> registerExisting(ParentDomainType parentType, UUID parentId,
                                                List<StoredFileInfo> storedFiles) {
        List<AttachedFile> result = new ArrayList<>();
        int order = 0;
        for (StoredFileInfo info : storedFiles) {
            AttachedFile af = attachedFileRepository.save(AttachedFile.builder()
                    .parentType(parentType)
                    .parentId(parentId)
                    .originalName(info.getOriginalName())
                    .storedPath(info.getStoredPath())
                    .contentType(info.getContentType())
                    .fileSize(info.getFileSize())
                    .sortOrder(order++)
                    .build());
            result.add(af);
        }
        return result;
    }

    @Transactional
    public FileResponse replaceSingle(ParentDomainType parentType, UUID parentId, MultipartFile newFile) {
        deleteAllByParent(parentType, parentId);
        List<FileResponse> saved = saveAll(parentType, parentId, List.of(newFile));
        return saved.isEmpty() ? null : saved.get(0);
    }

    public List<FileResponse> getFiles(ParentDomainType parentType, UUID parentId) {
        return attachedFileRepository.findByParentTypeAndParentIdOrderBySortOrderAsc(parentType, parentId)
                .stream()
                .map(af -> FileResponse.from(af, fileStorageService.getFileUrl(af.getStoredPath())))
                .toList();
    }

    public List<String> getAllStoredPaths(ParentDomainType parentType) {
        return attachedFileRepository.findAll().stream()
                .filter(af -> af.getParentType() == parentType)
                .map(AttachedFile::getStoredPath)
                .toList();
    }
}
