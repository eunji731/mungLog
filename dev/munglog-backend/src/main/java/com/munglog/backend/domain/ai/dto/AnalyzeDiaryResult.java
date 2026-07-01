package com.munglog.backend.domain.ai.dto;

import com.munglog.backend.common.file.dto.StoredFileInfo;
import lombok.Builder;
import java.util.List;

/**
 * AI 일지 분석 결과를 클라이언트에 반환하는 DTO.
 * AI가 생성한 일지 내용과 서버에 임시 저장된 파일 정보를 함께 포함한다.
 * 클라이언트는 이 결과를 확인 후 /api/ai/save 로 최종 저장을 요청한다.
 */
@Builder
public record AnalyzeDiaryResult(
        /** Gemini AI가 생성한 일지 내용 (제목, 요약, 순간 목록) */
        DailyLogResponse aiResult,
        /** 분석 과정에서 서버에 임시 저장된 이미지 파일 정보 목록 */
        List<StoredFileInfo> storedFiles
) {}
