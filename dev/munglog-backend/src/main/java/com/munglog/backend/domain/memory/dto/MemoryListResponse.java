package com.munglog.backend.domain.memory.dto;

import com.munglog.backend.domain.memory.domain.Memory;
import com.munglog.backend.domain.memory.domain.MemoryMoment;
import com.munglog.backend.domain.memory.domain.Photo;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 일지 목록 응답 DTO.
 * 일지 목록 조회 API에서 반환하는 데이터를 담는 레코드 클래스.
 * 주요 기능: 대표 사진과 순간 요약 정보를 포함하여 목록 화면에 필요한 정보 제공
 */
@Builder
public record MemoryListResponse(
        /** 일지의 고유 식별자 */
        UUID id,
        /** 일지 날짜 */
        LocalDate memoryDate,
        /** AI가 생성한 일지 제목 */
        String aiTitle,
        /** 일지 요약 내용 */
        String summary,
        /** 활동 장소 */
        String location,
        /** 에너지 레벨 (예: HIGH, MEDIUM, LOW) */
        String energyLevel,
        /** 목록 화면에 표시할 대표 사진 정보 */
        PhotoInfo representativePhoto,
        /** 이 일지에 속한 순간(활동 장면) 요약 목록 */
        List<MomentInfo> moments,
        /** 이 일지에 등장한 반려동물 UUID 목록 */
        List<UUID> petIds
) {

    /**
     * 대표 사진 정보 DTO.
     * 일지 목록에서 썸네일로 표시할 사진의 기본 정보를 담는다.
     */
    @Builder
    public record PhotoInfo(
            /** 사진의 고유 식별자 */
            UUID id,
            /** 원본 이미지 URL */
            String url,
            /** 300px 썸네일 이미지 URL */
            String thumb300,
            /** AI가 선정한 베스트 사진 여부 */
            boolean isBest
    ) {}

    /**
     * 순간(Moment) 요약 정보 DTO.
     * 일지 목록에서 각 활동 장면의 요약 정보를 표시하는 데 사용된다.
     */
    @Builder
    public record MomentInfo(
            /** 순간의 고유 식별자 */
            UUID id,
            /** 활동 카테고리 */
            String category,
            /** AI가 생성한 순간 제목 */
            String aiTitle,
            /** 장소 이름 */
            String locationName,
            /** 이 순간에 속한 사진 수 */
            int photoCount
    ) {}

    /**
     * [목적] Memory 엔티티를 MemoryListResponse DTO로 변환
     * [설명] 순간 요약 목록과 반려동물 ID 목록을 조합하고 대표 사진의 URL을 생성하여 반환한다.
     *        baseUrl은 상대 경로를 절대 URL로 변환하는 데 사용된다.
     *
     * @param memory  변환할 Memory 엔티티 (moments, memoryDogs, representativePhoto 로드 필요)
     * @param baseUrl 파일 경로를 절대 URL로 변환하기 위한 기본 URL
     * @return 변환된 MemoryListResponse DTO
     */
    public static MemoryListResponse from(Memory memory, String baseUrl) {
        List<MomentInfo> momentInfos = memory.getMoments().stream()
                .map(m -> MomentInfo.builder()
                        .id(m.getId())
                        .category(m.getCategory())
                        .aiTitle(m.getAiTitle())
                        .locationName(m.getLocationName())
                        .photoCount(m.getPhotos().size())
                        .build())
                .toList();

        List<UUID> petIds = memory.getMemoryDogs().stream()
                .map(md -> md.getDog().getId())
                .toList();

        PhotoInfo repPhoto = null;
        if (memory.getRepresentativePhoto() != null) {
            Photo p = memory.getRepresentativePhoto();
            repPhoto = PhotoInfo.builder()
                    .id(p.getId())
                    .url(p.getPathOrigin() != null ? baseUrl + "/" + p.getPathOrigin() : null)
                    .thumb300(p.getPathThumb300() != null ? baseUrl + "/" + p.getPathThumb300() : null)
                    .isBest(Boolean.TRUE.equals(p.getIsBest()))
                    .build();
        }

        return MemoryListResponse.builder()
                .id(memory.getId())
                .memoryDate(memory.getMemoryDate())
                .aiTitle(memory.getAiTitle())
                .summary(memory.getSummary())
                .location(memory.getLocation())
                .energyLevel(memory.getEnergyLevel())
                .representativePhoto(repPhoto)
                .moments(momentInfos)
                .petIds(petIds)
                .build();
    }
}
