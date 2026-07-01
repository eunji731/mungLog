package com.munglog.backend.domain.inquiry.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.member.domain.Member;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tb_inquiry")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Inquiry extends BaseTimeEntity {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String reply;

    @Column(name = "replied_at")
    private Instant repliedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replied_by")
    private Member repliedBy;

    @Column(name = "reply_read_at")
    private Instant replyReadAt;

    @Column(name = "admin_read_at")
    private Instant adminReadAt;

    public void reply(String reply, Member admin) {
        this.reply = reply;
        this.repliedAt = Instant.now();
        this.repliedBy = admin;
    }

    public void markReplyRead() {
        this.replyReadAt = Instant.now();
    }

    public void markAdminRead() {
        this.adminReadAt = Instant.now();
    }
}
