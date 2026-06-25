package com.munglog.backend.domain.schedule.dto;

import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.domain.schedule.domain.Schedule;
import com.munglog.backend.domain.schedule.domain.ScheduleType;
import lombok.Builder;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Builder
public record ScheduleResponse(
        UUID id,
        UUID petId,
        String petName,
        ScheduleType scheduleType,
        Boolean isCompleted,
        String title,
        LocalDateTime scheduleDate,
        String memo,
        String location,
        Long dDay,
        int attachmentCount,
        List<FileResponse> attachments,
        List<String> symptomTags,
        UUID inventoryItemId,
        String inventoryItemName,
        Integer inventoryItemStock,
        UUID convertedCareRecordId
) {
    public static ScheduleResponse of(Schedule schedule, List<FileResponse> attachments, List<String> symptomTags,
                                       UUID convertedCareRecordId) {
        long dDay = schedule.getScheduleDate() != null
                ? ChronoUnit.DAYS.between(LocalDateTime.now(), schedule.getScheduleDate())
                : 0;
        var linkedItem = schedule.getLinkedInventoryItem();
        return ScheduleResponse.builder()
                .id(schedule.getId())
                .petId(schedule.getPet().getId())
                .petName(schedule.getPet().getName())
                .scheduleType(schedule.getScheduleType())
                .isCompleted(schedule.getIsCompleted())
                .title(schedule.getTitle())
                .scheduleDate(schedule.getScheduleDate())
                .memo(schedule.getMemo())
                .location(schedule.getLocation())
                .dDay(dDay)
                .attachmentCount(attachments.size())
                .attachments(attachments)
                .symptomTags(symptomTags)
                .inventoryItemId(linkedItem != null ? linkedItem.getId() : null)
                .inventoryItemName(linkedItem != null ? linkedItem.getName() : null)
                .inventoryItemStock(linkedItem != null ? linkedItem.getStock() : null)
                .convertedCareRecordId(convertedCareRecordId)
                .build();
    }
}
