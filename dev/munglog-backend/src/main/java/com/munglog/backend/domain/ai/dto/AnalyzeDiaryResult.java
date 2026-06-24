package com.munglog.backend.domain.ai.dto;

import com.munglog.backend.common.file.dto.StoredFileInfo;
import lombok.Builder;
import java.util.List;

@Builder
public record AnalyzeDiaryResult(
        DailyLogResponse aiResult,
        List<StoredFileInfo> storedFiles
) {}
