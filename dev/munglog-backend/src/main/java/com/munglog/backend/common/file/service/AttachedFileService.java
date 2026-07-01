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

/**
 * 첨부파일 비즈니스 로직을 담당하는 서비스 클래스.
 * 실제 파일 저장/삭제는 FileStorageService에 위임하고,
 * DB의 attached_files 레코드 관리를 담당한다.
 * 기본 트랜잭션은 읽기 전용(readOnly=true)으로 성능을 최적화한다.
 */
@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class AttachedFileService {

    private final AttachedFileRepository attachedFileRepository;
    private final FileStorageService fileStorageService;

    /**
     * [목적] 업로드된 파일 목록을 스토리지에 저장하고 DB에 등록한다.
     * [설명] null이거나 비어있는 파일은 건너뛰며, 저장 순서(sortOrder)를 자동으로 부여한다.
     *
     * @param parentType 파일이 속할 도메인 타입
     * @param parentId   파일이 속할 부모 엔티티 UUID
     * @param files      저장할 MultipartFile 목록
     * @return 저장된 파일의 응답 DTO 목록
     */
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

    /**
     * [목적] 삭제할 파일 ID 목록과 추가할 파일 목록을 동시에 처리하여 파일을 동기화한다.
     * [설명] 1) deletedIds에 해당하는 파일을 스토리지와 DB에서 삭제
     *        → 2) 새 파일 저장 → 3) 최신 전체 목록 반환.
     *        같은 부모의 파일만 삭제하므로 타 도메인 파일 침범을 방지한다.
     *
     * @param parentType 도메인 타입
     * @param parentId   부모 엔티티 UUID
     * @param deletedIds 삭제할 파일 UUID 목록
     * @param newFiles   추가할 새 파일 목록
     * @return 동기화 후 전체 파일 목록
     */
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

    /**
     * [목적] 특정 부모 엔티티에 연결된 모든 첨부파일을 삭제한다.
     * [설명] 부모 엔티티 삭제 시 연관 파일을 일괄 정리하는 데 사용한다.
     *        스토리지 파일 삭제 후 DB 레코드도 삭제한다.
     *
     * @param parentType 도메인 타입
     * @param parentId   부모 엔티티 UUID
     */
    @Transactional
    public void deleteAllByParent(ParentDomainType parentType, UUID parentId) {
        List<AttachedFile> files = attachedFileRepository.findByParentTypeAndParentId(parentType, parentId);
        for (AttachedFile af : files) {
            fileStorageService.delete(af.getStoredPath());
        }
        attachedFileRepository.deleteAll(files);
    }

    /**
     * [목적] 이미 스토리지에 저장된 파일 정보를 DB에 등록한다.
     * [설명] AI 이미지 분석처럼 서비스 계층에서 직접 파일을 저장한 후
     *        나중에 DB에 등록할 때 사용한다.
     *
     * @param parentType  도메인 타입
     * @param parentId    부모 엔티티 UUID
     * @param storedFiles 이미 저장된 파일 정보 목록
     * @return DB에 등록된 AttachedFile 엔티티 목록
     */
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

    /**
     * [목적] 기존 파일을 모두 삭제하고 새 파일 하나로 교체한다.
     * [설명] 프로필 이미지처럼 단일 파일만 허용하는 경우에 사용한다.
     *
     * @param parentType 도메인 타입
     * @param parentId   부모 엔티티 UUID
     * @param newFile    교체할 새 파일
     * @return 새로 저장된 파일의 응답 DTO (파일이 없으면 null)
     */
    @Transactional
    public FileResponse replaceSingle(ParentDomainType parentType, UUID parentId, MultipartFile newFile) {
        deleteAllByParent(parentType, parentId);
        List<FileResponse> saved = saveAll(parentType, parentId, List.of(newFile));
        return saved.isEmpty() ? null : saved.get(0);
    }

    /**
     * [목적] 특정 부모 엔티티에 연결된 파일 목록을 정렬 순서대로 조회한다.
     *
     * @param parentType 도메인 타입
     * @param parentId   부모 엔티티 UUID
     * @return sortOrder 오름차순으로 정렬된 파일 응답 DTO 목록
     */
    public List<FileResponse> getFiles(ParentDomainType parentType, UUID parentId) {
        return attachedFileRepository.findByParentTypeAndParentIdOrderBySortOrderAsc(parentType, parentId)
                .stream()
                .map(af -> FileResponse.from(af, fileStorageService.getFileUrl(af.getStoredPath())))
                .toList();
    }

    /**
     * [목적] 특정 도메인 타입의 모든 저장 경로 목록을 반환한다.
     * [설명] 고아 파일 정리 스케줄러에서 전체 경로를 수집할 때 사용한다.
     *
     * @param parentType 도메인 타입
     * @return 해당 타입의 모든 storedPath 목록
     */
    public List<String> getAllStoredPaths(ParentDomainType parentType) {
        return attachedFileRepository.findAll().stream()
                .filter(af -> af.getParentType() == parentType)
                .map(AttachedFile::getStoredPath)
                .toList();
    }
}
