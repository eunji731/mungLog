package com.munglog.backend.domain.notice.dto;

import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.notice.domain.Notice;

import java.time.Instant;
import java.util.UUID;

/**
 * 공지사항 응답 DTO.
 * 클라이언트에 반환되는 공지사항 데이터 구조.
 * isNew 필드는 사용자가 마지막으로 공지를 확인한 시각 이후에 작성된 공지인지 여부를 나타낸다.
 *
 * @param id        공지사항 UUID
 * @param title     공지사항 제목
 * @param content   공지사항 본문
 * @param createdAt 작성 시각
 * @param updatedAt 마지막 수정 시각
 * @param isNew     사용자가 아직 읽지 않은 새 공지 여부
 */
public record NoticeResponse(
        UUID id,
        String title,
        String content,
        Instant createdAt,
        Instant updatedAt,
        boolean isNew
) {
    /**
     * [목적] 공지사항과 회원 정보를 기반으로 읽음 여부를 포함한 응답 객체를 생성한다.
     * [설명] 회원의 lastNoticeReadAt이 null이거나 공지 작성 시각보다 이전이면 isNew=true로 설정한다.
     *
     * @param notice 공지사항 엔티티
     * @param member 현재 로그인 회원 (읽음 시각 비교에 사용)
     * @return 읽음 여부가 포함된 공지사항 응답 DTO
     */
    public static NoticeResponse from(Notice notice, Member member) {
        Instant lastRead = member.getLastNoticeReadAt();
        boolean isNew = lastRead == null || notice.getCreatedAt().isAfter(lastRead);
        return new NoticeResponse(
                notice.getId(),
                notice.getTitle(),
                notice.getContent(),
                notice.getCreatedAt(),
                notice.getUpdatedAt(),
                isNew
        );
    }

    /**
     * [목적] 읽음 여부 없이 공지사항 응답 객체를 생성한다.
     * [설명] 관리자 응답 등 읽음 여부 계산이 불필요한 경우에 사용하며, isNew는 항상 false로 고정된다.
     *
     * @param notice 공지사항 엔티티
     * @return isNew=false인 공지사항 응답 DTO
     */
    public static NoticeResponse from(Notice notice) {
        return new NoticeResponse(
                notice.getId(),
                notice.getTitle(),
                notice.getContent(),
                notice.getCreatedAt(),
                notice.getUpdatedAt(),
                false
        );
    }
}
