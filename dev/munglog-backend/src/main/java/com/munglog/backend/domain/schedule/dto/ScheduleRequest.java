package com.munglog.backend.domain.schedule.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 일정 등록·수정 요청 DTO.
 * 클라이언트가 일정을 등록하거나 수정할 때 전달하는 데이터 클래스.
 */
@Getter
@NoArgsConstructor
public class ScheduleRequest {
    /** 반려동물 UUID */
    private UUID petId;
    /** 일정 유형 (ScheduleType enum 이름) */
    private String scheduleType;
    /** 일정 날짜·시간 */
    private LocalDateTime scheduleDate;
    /** 일정 제목 */
    private String title;
    /** 메모 */
    private String memo;
    /** 장소 */
    private String location;
    /** 증상 태그 목록 */
    private List<String> symptomTags;
    /** 첨부파일 ID 목록 */
    private List<UUID> fileIds;
    /** 연결할 용품 UUID (없으면 null) */
    private UUID inventoryItemId;
    /** 연결할 예방접종 종류 ID (없으면 null) */
    private Long vaccinationTypeId;
}
