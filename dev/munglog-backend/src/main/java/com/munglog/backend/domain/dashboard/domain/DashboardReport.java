package com.munglog.backend.domain.dashboard.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.pet.domain.Pet;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

/**
 * AI 대시보드 리포트 엔티티.
 * 사용자(및 선택적으로 반려동물)별로 특정 월에 AI가 생성한 분석 리포트를 저장하는 클래스.
 * 주요 기능: 월간 리포트 내용 업데이트
 */
@Entity
@Table(name = "dashboard_reports")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DashboardReport extends BaseTimeEntity {

    /** 리포트 고유 식별자 (UUID 자동 생성) */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 리포트를 요청한 사용자 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Member user;

    /** 리포트 대상 반려동물 (null이면 그룹 전체 기준 리포트) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id")
    private Pet pet;

    /** 리포트 대상 연월 (예: "2025-07") */
    @Column(name = "report_year_month")
    private String reportYearMonth;

    /** AI가 생성한 월간 요약 리포트 (JSON 문자열) */
    @Column(name = "monthly_report", columnDefinition = "TEXT")
    private String monthlyReport;

    /** AI가 분석한 반려동물 성향 인사이트 (JSON 문자열) */
    @Column(name = "personality_insight", columnDefinition = "TEXT")
    private String personalityInsight;

    /** AI가 분석한 활동 수준 인사이트 (JSON 문자열) */
    @Column(name = "activity_insight", columnDefinition = "TEXT")
    private String activityInsight;

    /** AI가 분석한 장소 패턴 인사이트 (JSON 문자열) */
    @Column(name = "location_insight", columnDefinition = "TEXT")
    private String locationInsight;

    /** AI가 보호자에게 전하는 메시지 */
    @Column(name = "guardian_message", columnDefinition = "TEXT")
    private String guardianMessage;

    /** AI가 제안하는 다음 달 활동 추천 */
    @Column(name = "next_suggestion", columnDefinition = "TEXT")
    private String nextSuggestion;

    /**
     * [목적] AI가 생성한 리포트 내용을 업데이트한다.
     * [설명] 기존 리포트를 재생성할 때 새 AI 응답으로 모든 필드를 덮어쓴다.
     *
     * @param monthlyReport       월간 요약 리포트 (JSON)
     * @param personalityInsight  성향 인사이트 (JSON)
     * @param activityInsight     활동 인사이트 (JSON)
     * @param locationInsight     장소 인사이트 (JSON)
     * @param guardianMessage     보호자 메시지
     * @param nextSuggestion      다음 달 활동 추천
     */
    public void updateContent(String monthlyReport, String personalityInsight, String activityInsight,
                              String locationInsight, String guardianMessage, String nextSuggestion) {
        this.monthlyReport = monthlyReport;
        this.personalityInsight = personalityInsight;
        this.activityInsight = activityInsight;
        this.locationInsight = locationInsight;
        this.guardianMessage = guardianMessage;
        this.nextSuggestion = nextSuggestion;
    }
}
