package com.munglog.backend.domain.inquiry.dto;

import com.munglog.backend.domain.inquiry.domain.Inquiry;

import java.time.Instant;
import java.util.UUID;

public record InquiryResponse(
        UUID id,
        String title,
        String content,
        String reply,
        boolean isReplied,
        boolean isReplyNew,
        boolean isNew,
        Instant createdAt,
        Instant repliedAt
) {
    public static InquiryResponse forUser(Inquiry inquiry) {
        boolean isReplied = inquiry.getReply() != null;
        boolean isReplyNew = isReplied && inquiry.getReplyReadAt() == null;
        return new InquiryResponse(
                inquiry.getId(),
                inquiry.getTitle(),
                inquiry.getContent(),
                inquiry.getReply(),
                isReplied,
                isReplyNew,
                false,
                inquiry.getCreatedAt(),
                inquiry.getRepliedAt()
        );
    }

    public static InquiryResponse forAdmin(Inquiry inquiry) {
        boolean isNew = inquiry.getAdminReadAt() == null;
        return new InquiryResponse(
                inquiry.getId(),
                inquiry.getTitle(),
                inquiry.getContent(),
                inquiry.getReply(),
                inquiry.getReply() != null,
                false,
                isNew,
                inquiry.getCreatedAt(),
                inquiry.getRepliedAt()
        );
    }
}
