package com.munglog.backend.domain.ai.domain;

import com.munglog.backend.domain.member.domain.Member;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * AI 기능 사용 내역을 기록하는 엔티티.
 * 주요 기능: 날짜별·일별 AI 사용 횟수 추적, 사용 제한 초과 여부 판단 기준 데이터 제공
 */
@Entity
@Table(name = "ai_usages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AiDiaryUsage {

    /** 사용 내역 고유 식별자 */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** AI 기능을 사용한 회원 (지연 로딩) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    /** AI 분석 대상 날짜 (날짜별 제한 판단에 사용) */
    @Column(name = "target_date")
    private LocalDate targetDate;

    /** AI 기능이 실제 호출된 일시 (일별 제한 판단에 사용) */
    @Column(name = "called_at")
    private LocalDateTime calledAt;

    /**
     * AI 사용 유형 구분자.
     * ANALYZE: 일지 분석, DAILY: 일일 총량 카운트, INVENTORY: 제품 이미지 분석
     */
    @Column(name = "usage_type")
    private String usageType;
}
