package com.munglog.backend.domain.notice.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.member.domain.Member;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

/**
 * 공지사항 엔티티.
 * 관리자가 작성한 공지사항 데이터를 표현하며, 제목·본문·작성자를 포함한다.
 * 주요 기능: 공지 등록, 내용 수정
 */
@Entity
@Table(name = "tb_notice")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Notice extends BaseTimeEntity {

    /** 공지사항 고유 식별자 (UUID 자동 생성) */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 공지사항을 작성한 관리자 회원 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private Member author;

    /** 공지사항 제목 */
    @Column(nullable = false)
    private String title;

    /** 공지사항 본문 내용 */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * [목적] 공지사항의 제목과 내용을 수정한다.
     * [설명] 엔티티 내부에서 필드를 직접 변경하여 변경 감지(dirty checking)가 동작하도록 한다.
     *
     * @param title   새 제목
     * @param content 새 본문
     */
    public void update(String title, String content) {
        this.title = title;
        this.content = content;
    }
}
