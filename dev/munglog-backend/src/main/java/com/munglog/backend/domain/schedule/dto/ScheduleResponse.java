package com.munglog.backend.domain.schedule.dto;

import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.domain.schedule.domain.Schedule;
import com.munglog.backend.domain.schedule.domain.ScheduleType;
import lombok.Builder;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

/**
 * 일정 응답 DTO.
 * 클라이언트에 반환하는 일정 정보 레코드.
 * dDay는 현재 시각 기준 일정까지 남은 일수(음수이면 지남)이며,
 * convertedCareRecordId는 케어기록으로 전환된 경우 해당 UUID이다.
 */
@Builder
public record ScheduleResponse(
        /** 일정 고유 ID */
        UUID id,
        /** 반려동물 UUID */
        UUID petId,
        /** 반려동물 이름 */
        String petName,
        /** 일정 유형 */
        ScheduleType scheduleType,
        /** 완료 여부 */
        Boolean isCompleted,
        /** 일정 제목 */
        String title,
        /** 일정 날짜·시간 */
        LocalDateTime scheduleDate,
        /** 메모 */
        String memo,
        /** 장소 */
        String location,
        /** D-Day (음수: 지남, 양수: 남음) */
        Long dDay,
        /** 첨부파일 수 */
        int attachmentCount,
        /** 첨부파일 목록 */
        List<FileResponse> attachments,
        /** 증상 태그 목록 */
        List<String> symptomTags,
        /** 연결 용품 UUID */
        UUID inventoryItemId,
        /** 연결 용품 이름 */
        String inventoryItemName,
        /** 연결 용품 재고 수량 */
        Integer inventoryItemStock,
        /** 케어기록으로 전환된 경우 해당 UUID */
        UUID convertedCareRecordId,
        /** 연결 예방접종 종류 ID */
        Long vaccinationTypeId,
        /** 연결 예방접종 종류 이름 */
        String vaccinationTypeName,
        /** 예방접종 권장 간격 (일) */
        Integer vaccinationIntervalDays
) {
    /**
     * [목적] Schedule 엔티티와 부가 정보로 응답 DTO를 생성한다.
     * [설명] dDay는 현재 시각과 scheduleDate 사이의 일 수 차이로 계산한다.
     *
     * @param schedule             일정 엔티티
     * @param attachments          첨부파일 목록
     * @param symptomTags          증상 태그 목록
     * @param convertedCareRecordId 전환된 케어기록 UUID (없으면 null)
     * @return 일정 응답 DTO
     */
    public static ScheduleResponse of(Schedule schedule, List<FileResponse> attachments, List<String> symptomTags,
                                       UUID convertedCareRecordId) {
        long dDay = schedule.getScheduleDate() != null
                ? ChronoUnit.DAYS.between(LocalDateTime.now(), schedule.getScheduleDate())
                : 0;
        var linkedItem = schedule.getLinkedInventoryItem();
        var vt = schedule.getVaccinationType();
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
                .vaccinationTypeId(vt != null ? vt.getId() : null)
                .vaccinationTypeName(vt != null ? vt.getName() : null)
                .vaccinationIntervalDays(vt != null ? vt.getIntervalDays() : null)
                .build();
    }
}
