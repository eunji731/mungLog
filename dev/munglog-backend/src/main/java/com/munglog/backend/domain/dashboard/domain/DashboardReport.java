package com.munglog.backend.domain.dashboard.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.pet.domain.Pet;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "dashboard_reports")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DashboardReport extends BaseTimeEntity {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Member user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id")
    private Pet pet;

    @Column(name = "report_year_month")
    private String reportYearMonth;

    @Column(name = "monthly_report", columnDefinition = "TEXT")
    private String monthlyReport;

    @Column(name = "personality_insight", columnDefinition = "TEXT")
    private String personalityInsight;

    @Column(name = "activity_insight", columnDefinition = "TEXT")
    private String activityInsight;

    @Column(name = "location_insight", columnDefinition = "TEXT")
    private String locationInsight;

    @Column(name = "guardian_message", columnDefinition = "TEXT")
    private String guardianMessage;

    @Column(name = "next_suggestion", columnDefinition = "TEXT")
    private String nextSuggestion;

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
