package com.munglog.backend.domain.symptomsnap.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * 증상 스냅 등록/수정 요청 DTO.
 * 새 증상 스냅을 등록하거나 기존 스냅을 수정할 때 사용하는 요청 클래스.
 */
@Getter
@NoArgsConstructor
public class SymptomSnapRequest {

    /** 증상이 관찰된 반려동물 UUID */
    private UUID petId;

    /** 증상 관찰 날짜 */
    private LocalDate date;

    /** 증상 관찰 시각 */
    private LocalTime time;

    /** 관찰된 증상 태그 목록 (증상명 문자열) */
    private List<String> symptomTags;

    /** 증상에 대한 메모 */
    private String memo;
}
