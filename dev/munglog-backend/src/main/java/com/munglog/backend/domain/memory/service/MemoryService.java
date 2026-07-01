package com.munglog.backend.domain.memory.service;

import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.service.AttachedFileService;
import com.munglog.backend.domain.family.service.FamilyGroupService;
import com.munglog.backend.domain.memory.domain.Memory;
import com.munglog.backend.domain.memory.dto.MemoryDetailResponse;
import com.munglog.backend.domain.memory.dto.MemoryListResponse;
import com.munglog.backend.domain.memory.repository.MemoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 기억(Memory) 서비스.
 * 기억 목록 조회·상세 조회·삭제 비즈니스 로직을 처리하는 클래스.
 * AI 다이어리 생성 후 저장된 기억을 그룹 단위로 관리하며,
 * 삭제 시 첨부파일(사진, 다이어리)도 함께 제거한다.
 * 주요 기능: 기억 목록·상세 조회, 삭제
 */
@Service
@RequiredArgsConstructor
public class MemoryService {

    private final MemoryRepository memoryRepository;
    private final AttachedFileService attachedFileService;
    private final FamilyGroupService familyGroupService;

    /** application.yml에서 설정된 서버 기본 URL (이미지 경로 조합에 사용) */
    @Value("${app.base-url:}")
    private String baseUrl;

    /**
     * [목적] 현재 사용자 그룹의 기억 목록을 조회한다.
     * [설명] 날짜 범위가 지정된 경우 해당 기간 내 기억만, 아니면 전체를 최신순으로 반환한다.
     *        그룹이 없으면 빈 목록을 반환한다.
     *
     * @param userId    요청 사용자 UUID
     * @param startDate 시작일 (null 허용)
     * @param endDate   종료일 (null 허용)
     * @return 기억 목록 DTO (그룹 없으면 빈 목록)
     */
    @Transactional(readOnly = true)
    public List<MemoryListResponse> getMemories(UUID userId, LocalDate startDate, LocalDate endDate) {
        return familyGroupService.findGroupIdByUserId(userId).map(groupId -> {
            List<Memory> memories = (startDate != null && endDate != null)
                    ? memoryRepository.findByGroupIdAndMemoryDateBetween(groupId, startDate, endDate)
                    : memoryRepository.findByGroupIdOrderByMemoryDateDesc(groupId);
            return memories.stream().map(m -> MemoryListResponse.from(m, baseUrl)).toList();
        }).orElse(List.of());
    }

    /**
     * [목적] 특정 기억의 상세 정보를 조회한다.
     * [설명] 그룹 소속 여부를 검증하여 타 그룹 기억에 접근하지 못하도록 한다.
     *
     * @param memoryId 조회할 기억 UUID
     * @param userId   요청 사용자 UUID
     * @return 기억 상세 응답 DTO
     * @throws IllegalArgumentException 기억이 없거나 그룹 접근 권한이 없을 경우
     */
    @Transactional(readOnly = true)
    public MemoryDetailResponse getMemoryDetail(UUID memoryId, UUID userId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        Memory memory = memoryRepository.findByIdAndGroupId(memoryId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("일지를 찾을 수 없습니다."));
        return MemoryDetailResponse.from(memory);
    }

    /**
     * [목적] 기억을 삭제한다.
     * [설명] 기억 소유자(user_id)만 삭제할 수 있으며,
     *        MEMORY와 DIARY 타입의 첨부파일을 모두 제거한 후 기억을 삭제한다.
     *
     * @param memoryId 삭제할 기억 UUID
     * @param userId   요청 사용자 UUID
     * @throws IllegalArgumentException 기억이 없거나 소유자가 아닐 경우
     */
    @Transactional
    public void deleteMemory(UUID memoryId, UUID userId) {
        Memory memory = memoryRepository.findByIdAndUser_Id(memoryId, userId)
                .orElseThrow(() -> new IllegalArgumentException("일지를 찾을 수 없습니다."));

        attachedFileService.deleteAllByParent(ParentDomainType.MEMORY, memoryId);
        attachedFileService.deleteAllByParent(ParentDomainType.DIARY, memoryId);
        memoryRepository.delete(memory);
    }
}
