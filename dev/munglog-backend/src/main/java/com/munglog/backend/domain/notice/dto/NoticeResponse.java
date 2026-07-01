package com.munglog.backend.domain.notice.dto;

import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.notice.domain.Notice;

import java.time.Instant;
import java.util.UUID;

public record NoticeResponse(
        UUID id,
        String title,
        String content,
        Instant createdAt,
        Instant updatedAt,
        boolean isNew
) {
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
