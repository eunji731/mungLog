package com.munglog.backend.domain.inquiry.dto;

import com.munglog.backend.domain.inquiry.domain.Inquiry;

import java.time.Instant;
import java.util.UUID;

/**
 * 문의 응답 DTO.
 * 사용자 뷰와 관리자 뷰에서 각각 다른 필드를 활성화한다.
 *   - 사용자 뷰: isReplyNew(새 답변 여부) 활성화, isNew는 항상 false
 *   - 관리자 뷰: isNew(미읽음 여부) 활성화, isReplyNew는 항상 false
 */
public record InquiryResponse(
        /** 문의 UUID */
        UUID id,
        /** 문의 제목 */
        String title,
        /** 문의 본문 내용 */
        String content,
        /** 관리자 답변 내용 (미답변 시 null) */
        String reply,
        /** 답변이 등록되었는지 여부 */
        boolean isReplied,
        /** 사용자가 아직 읽지 않은 새 답변인지 여부 (사용자 뷰 전용) */
        boolean isReplyNew,
        /** 관리자가 아직 읽지 않은 새 문의인지 여부 (관리자 뷰 전용) */
        boolean isNew,
        /** 문의 등록 시각 */
        Instant createdAt,
        /** 답변 등록 시각 (미답변 시 null) */
        Instant repliedAt
) {
    /**
     * [목적] 사용자 화면을 위한 응답 DTO를 생성한다.
     * [설명] 답변이 있고 사용자가 아직 읽지 않았으면 isReplyNew=true로 설정된다.
     *        isNew는 사용자 뷰에서 사용하지 않으므로 항상 false이다.
     *
     * @param inquiry 문의 엔티티
     * @return 사용자용 InquiryResponse
     */
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

    /**
     * [목적] 관리자 화면을 위한 응답 DTO를 생성한다.
     * [설명] 관리자가 아직 읽지 않은 문의는 isNew=true로 설정된다.
     *        isReplyNew는 관리자 뷰에서 사용하지 않으므로 항상 false이다.
     *
     * @param inquiry 문의 엔티티
     * @return 관리자용 InquiryResponse
     */
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
