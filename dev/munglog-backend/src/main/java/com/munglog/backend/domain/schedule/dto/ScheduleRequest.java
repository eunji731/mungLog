package com.munglog.backend.domain.schedule.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor
public class ScheduleRequest {
    private UUID petId;
    private String scheduleType;
    private LocalDateTime scheduleDate;
    private String title;
    private String memo;
    private String location;
    private List<String> symptomTags;
    private List<UUID> fileIds;
    private UUID inventoryItemId;
    private Long vaccinationTypeId;
}
