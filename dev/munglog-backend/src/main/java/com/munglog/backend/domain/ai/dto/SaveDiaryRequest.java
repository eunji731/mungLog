package com.munglog.backend.domain.ai.dto;

import com.munglog.backend.common.file.dto.StoredFileInfo;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * AI 일지 분석 결과를 영구 저장할 때 클라이언트가 전달하는 요청 DTO.
 * /api/ai/analyze 응답으로 받은 데이터를 그대로 담아 /api/ai/save 에 전송한다.
 */
@Getter
@NoArgsConstructor
public class SaveDiaryRequest {
    /** 일지 대상 날짜 */
    private LocalDate targetDate;
    /** AI 분석 결과 (제목, 요약, 순간 목록) */
    private DailyLogResponse aiResult;
    /** 분석 과정에서 임시 저장된 파일 정보 목록 */
    private List<StoredFileInfo> storedFiles;
    /** 이 일지에 등장하는 반려동물 ID 목록 */
    private List<UUID> petIds;
    /**
     * 재분석 저장 시 교체할 기존 Memory ID.
     * null이면 새 Memory를 생성하고, 값이 있으면 기존 Memory를 삭제 후 재생성한다.
     */
    private UUID oldMemoryId;
}
