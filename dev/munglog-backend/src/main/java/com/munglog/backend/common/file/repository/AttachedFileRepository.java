package com.munglog.backend.common.file.repository;

import com.munglog.backend.common.file.domain.AttachedFile;
import com.munglog.backend.common.file.domain.ParentDomainType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AttachedFileRepository extends JpaRepository<AttachedFile, UUID> {

    List<AttachedFile> findByParentTypeAndParentIdOrderBySortOrderAsc(ParentDomainType parentType, UUID parentId);

    List<AttachedFile> findByIdInAndParentTypeAndParentId(List<UUID> ids, ParentDomainType parentType, UUID parentId);

    List<AttachedFile> findByParentTypeAndParentId(ParentDomainType parentType, UUID parentId);
}
