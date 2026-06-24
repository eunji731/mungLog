package com.munglog.backend.domain.memory.service;

import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.service.AttachedFileService;
import com.munglog.backend.domain.memory.domain.Memory;
import com.munglog.backend.domain.memory.dto.MemoryListResponse;
import com.munglog.backend.domain.memory.repository.MemoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MemoryService {

    private final MemoryRepository memoryRepository;
    private final AttachedFileService attachedFileService;

    @Value("${app.base-url:}")
    private String baseUrl;

    @Transactional(readOnly = true)
    public List<MemoryListResponse> getMemories(UUID userId, LocalDate startDate, LocalDate endDate) {
        List<Memory> memories;
        if (startDate != null && endDate != null) {
            memories = memoryRepository.findByUser_IdAndMemoryDateBetweenOrderByMemoryDateDesc(userId, startDate, endDate);
        } else {
            memories = memoryRepository.findByUser_IdOrderByMemoryDateDesc(userId);
        }
        return memories.stream().map(m -> MemoryListResponse.from(m, baseUrl)).toList();
    }

    @Transactional
    public void deleteMemory(UUID memoryId, UUID userId) {
        Memory memory = memoryRepository.findByIdAndUser_Id(memoryId, userId)
                .orElseThrow(() -> new IllegalArgumentException("일지를 찾을 수 없습니다."));

        attachedFileService.deleteAllByParent(ParentDomainType.MEMORY, memoryId);
        attachedFileService.deleteAllByParent(ParentDomainType.DIARY, memoryId);
        memoryRepository.delete(memory);
    }
}
