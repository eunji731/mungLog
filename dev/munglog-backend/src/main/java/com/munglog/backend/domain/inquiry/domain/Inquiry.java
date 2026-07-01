package com.munglog.backend.domain.inquiry.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.member.domain.Member;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

/**
 * 1:1 문의 엔티티.
 * 사용자가 작성한 문의 제목·내용과 관리자 답변, 읽음 시각을 함께 관리한다.
 * 읽음 처리는 두 방향으로 이루어진다.
 *   - adminReadAt: 관리자가 해당 문의를 확인한 시각
 *   - replyReadAt: 사용자가 관리자 답변을 확인한 시각
 * 주요 기능: 답변 등록, 관리자 읽음 처리, 사용자 답변 읽음 처리
 */
@Entity
@Table(name = "tb_inquiry")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Inquiry extends BaseTimeEntity {

    /** 문의 고유 식별자 (UUID) */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 문의를 작성한 사용자 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    /** 문의 제목 */
    @Column(nullable = false)
    private String title;

    /** 문의 본문 내용 */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /** 관리자 답변 내용 (미답변 시 null) */
    @Column(columnDefinition = "TEXT")
    private String reply;

    /** 관리자가 답변을 등록한 시각 */
    @Column(name = "replied_at")
    private Instant repliedAt;

    /** 답변을 작성한 관리자 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replied_by")
    private Member repliedBy;

    /** 사용자가 답변을 읽은 시각 (null이면 미읽음) */
    @Column(name = "reply_read_at")
    private Instant replyReadAt;

    /** 관리자가 이 문의를 읽은 시각 (null이면 미읽음) */
    @Column(name = "admin_read_at")
    private Instant adminReadAt;

    /**
     * [목적] 관리자 답변을 등록한다.
     * [설명] 답변 내용, 등록 시각, 답변 관리자를 함께 기록한다.
     *
     * @param reply 답변 텍스트
     * @param admin 답변을 작성한 관리자 엔티티
     */
    public void reply(String reply, Member admin) {
        this.reply = reply;
        this.repliedAt = Instant.now();
        this.repliedBy = admin;
    }

    /**
     * [목적] 사용자가 답변을 읽었음을 기록한다.
     * [설명] replyReadAt을 현재 시각으로 설정한다. 이후 isReplyNew가 false로 처리된다.
     */
    public void markReplyRead() {
        this.replyReadAt = Instant.now();
    }

    /**
     * [목적] 관리자가 이 문의를 읽었음을 기록한다.
     * [설명] adminReadAt을 현재 시각으로 설정한다. 이후 미읽음 카운트에서 제외된다.
     */
    public void markAdminRead() {
        this.adminReadAt = Instant.now();
    }
}
