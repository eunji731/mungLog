package com.munglog.backend.domain.symptomsnap.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.munglog.backend.domain.symptomsnap.domain.SymptomSnap;
import com.munglog.backend.domain.symptomsnap.domain.SymptomSnapStatus;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * 증상 스냅 응답 DTO.
 * 증상 스냅 정보를 API 응답으로 전달하는 record 클래스.
 * 연동된 진료 기록 제목과 일정 제목을 함께 포함한다.
 *
 * @param id                   증상 스냅 UUID
 * @param petId                반려동물 UUID
 * @param date                 증상 관찰 날짜
 * @param time                 증상 관찰 시각 (HH:mm 형식)
 * @param symptomTags          증상 태그 목록
 * @param memo                 메모
 * @param photoUrl             증상 사진 URL
 * @param status               처리 상태 (MONITORING / RESOLVED)
 * @param resolvedRecordId     연동된 진료 기록 UUID
 * @param resolvedRecordTitle  연동된 진료 기록 제목
 * @param linkedScheduleId     연동된 일정 UUID
 * @param linkedScheduleTitle  연동된 일정 제목
 */
@Builder
public record SymptomSnapResponse(
        UUID id,
        UUID petId,
        LocalDate date,
        @JsonFormat(pattern = "HH:mm") LocalTime time,
        List<String> symptomTags,
        String memo,
        String photoUrl,
        SymptomSnapStatus status,
        UUID resolvedRecordId,
        String resolvedRecordTitle,
        UUID linkedScheduleId,
        String linkedScheduleTitle
) {
    /**
     * [목적] SymptomSnap 엔티티와 부가 정보를 응답 DTO로 변환한다.
     *
     * @param snap                 변환할 증상 스냅 엔티티
     * @param symptomTags          증상 태그 목록
     * @param photoUrl             증상 사진 URL
     * @param resolvedRecordTitle  연동된 진료 기록 제목
     * @param linkedScheduleTitle  연동된 일정 제목
     * @return 증상 스냅 응답 DTO
     */
    public static SymptomSnapResponse from(SymptomSnap snap, List<String> symptomTags,
                                            String photoUrl, String resolvedRecordTitle,
                                            String linkedScheduleTitle) {
        return SymptomSnapResponse.builder()
                .id(snap.getId())
                .petId(snap.getPet().getId())
                .date(snap.getDate())
                .time(snap.getTime())
                .symptomTags(symptomTags)
                .memo(snap.getMemo())
                .photoUrl(photoUrl)
                .status(snap.getStatus())
                .resolvedRecordId(snap.getResolvedRecordId())
                .resolvedRecordTitle(resolvedRecordTitle)
                .linkedScheduleId(snap.getLinkedScheduleId())
                .linkedScheduleTitle(linkedScheduleTitle)
                .build();
    }
}
