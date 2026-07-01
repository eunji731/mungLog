package com.munglog.backend.common.file.repository;

import com.munglog.backend.common.file.domain.AttachedFile;
import com.munglog.backend.common.file.domain.ParentDomainType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * 첨부파일 JPA 레포지토리.
 * 부모 도메인 타입과 부모 엔티티 ID 기반의 파일 조회 기능을 제공한다.
 */
public interface AttachedFileRepository extends JpaRepository<AttachedFile, UUID> {

    /**
     * [목적] 특정 도메인 엔티티에 속한 첨부파일을 정렬 순서대로 조회한다.
     *
     * @param parentType 도메인 타입 (예: MEMORY, PET_PROFILE)
     * @param parentId   부모 엔티티 UUID
     * @return sortOrder 오름차순으로 정렬된 첨부파일 목록
     */
    List<AttachedFile> findByParentTypeAndParentIdOrderBySortOrderAsc(ParentDomainType parentType, UUID parentId);

    /**
     * [목적] 삭제할 파일 UUID 목록 중 특정 부모에 속하는 파일만 조회한다.
     * [설명] 다른 도메인의 파일을 잘못 삭제하는 것을 방지하기 위해
     *        parentType과 parentId로 범위를 제한한다.
     *
     * @param ids        삭제 대상 파일 UUID 목록
     * @param parentType 도메인 타입
     * @param parentId   부모 엔티티 UUID
     * @return 조건에 맞는 첨부파일 목록
     */
    List<AttachedFile> findByIdInAndParentTypeAndParentId(List<UUID> ids, ParentDomainType parentType, UUID parentId);

    /**
     * [목적] 특정 도메인 엔티티에 속한 첨부파일 목록을 조회한다. (정렬 없음)
     * [설명] 전체 삭제 등 순서가 중요하지 않은 경우에 사용한다.
     *
     * @param parentType 도메인 타입
     * @param parentId   부모 엔티티 UUID
     * @return 해당 부모에 속한 첨부파일 목록
     */
    List<AttachedFile> findByParentTypeAndParentId(ParentDomainType parentType, UUID parentId);
}
