package com.munglog.backend.domain.archive.dto;

import com.munglog.backend.domain.memory.domain.Photo;
import com.munglog.backend.domain.memory.domain.PhotoThemeTag;
import lombok.Builder;

import java.util.List;
import java.util.UUID;

/**
 * 아카이브 사진 응답 DTO.
 * 사진 정보와 연결된 추억(Memory), 테마 태그 목록을 함께 반환하는 레코드 클래스.
 */
@Builder
public record ArchivePhotoResponse(
        /** 사진 고유 ID */
        UUID photoId,
        /** 사진 접근 URL (썸네일 또는 원본) */
        String photoUrl,
        /** 추억 날짜 (yyyy-MM-dd) */
        String memoryDate,
        /** AI가 생성한 추억 제목 */
        String memoryTitle,
        /** 연결된 추억 ID */
        UUID memoryId,
        /** 베스트 사진 여부 */
        Boolean isBest,
        /** AI가 부여한 감성 점수 (0~100) */
        Integer vibeScore,
        /** AI가 작성한 사진 한마디 */
        String aiComment,
        /** 이 사진에 붙은 테마 태그 목록 */
        List<String> themeTags
) {
    /**
     * [목적] Photo 엔티티와 URL, 태그 목록을 받아 ArchivePhotoResponse를 생성한다.
     *
     * @param photo    사진 엔티티
     * @param photoUrl 사진 접근 URL
     * @param tags     테마 태그 문자열 목록
     * @return 변환된 ArchivePhotoResponse 인스턴스
     */
    public static ArchivePhotoResponse from(Photo photo, String photoUrl, List<String> tags) {
        return ArchivePhotoResponse.builder()
                .photoId(photo.getId())
                .photoUrl(photoUrl)
                .memoryDate(photo.getMemory().getMemoryDate() != null ? photo.getMemory().getMemoryDate().toString() : null)
                .memoryTitle(photo.getMemory().getAiTitle())
                .memoryId(photo.getMemory().getId())
                .isBest(photo.getIsBest())
                .vibeScore(photo.getVibeScore())
                .aiComment(photo.getAiComment())
                .themeTags(tags)
                .build();
    }
}
