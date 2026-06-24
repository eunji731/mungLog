package com.munglog.backend.domain.ai.dto;

import com.munglog.backend.common.file.dto.StoredFileInfo;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor
public class SaveDiaryRequest {
    private LocalDate targetDate;
    private DailyLogResponse aiResult;
    private List<StoredFileInfo> storedFiles;
    private List<UUID> petIds;
}
