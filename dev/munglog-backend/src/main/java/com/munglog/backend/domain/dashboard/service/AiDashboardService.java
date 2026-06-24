package com.munglog.backend.domain.dashboard.service;

import com.munglog.backend.common.ai.GeminiClient;
import com.munglog.backend.common.exception.AiRateLimitException;
import com.munglog.backend.domain.ai.domain.AiDiaryUsage;
import com.munglog.backend.domain.ai.repository.AiDiaryUsageRepository;
import com.munglog.backend.domain.dashboard.domain.DashboardReport;
import com.munglog.backend.domain.dashboard.dto.AiReportResponse;
import com.munglog.backend.domain.dashboard.repository.DashboardReportRepository;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import com.munglog.backend.domain.memory.repository.MemoryMomentRepository;
import com.munglog.backend.domain.memory.repository.MemoryRepository;
import com.munglog.backend.domain.pet.domain.Pet;
import com.munglog.backend.domain.pet.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiDashboardService {

    private static final int DAILY_LIMIT = 3;
    private static final String USAGE_TYPE = "DASHBOARD";
    private static final DateTimeFormatter YEAR_MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    private final GeminiClient geminiClient;
    private final MemberRepository memberRepository;
    private final PetRepository petRepository;
    private final MemoryRepository memoryRepository;
    private final MemoryMomentRepository memoryMomentRepository;
    private final DashboardReportRepository dashboardReportRepository;
    private final AiDiaryUsageRepository aiDiaryUsageRepository;

    @Transactional(readOnly = true)
    public AiReportResponse getReport(UUID userId, UUID petId, String yearMonth) {
        if (yearMonth == null) yearMonth = LocalDate.now().format(YEAR_MONTH_FMT);
        DashboardReport report = petId != null
                ? dashboardReportRepository.findByUser_IdAndPet_IdAndReportYearMonth(userId, petId, yearMonth).orElse(null)
                : dashboardReportRepository.findByUser_IdAndPetIsNullAndReportYearMonth(userId, yearMonth).orElse(null);
        return AiReportResponse.from(report);
    }

    @Transactional
    public AiReportResponse refreshReport(UUID userId, UUID petId, String yearMonth) {
        if (yearMonth == null) yearMonth = LocalDate.now().format(YEAR_MONTH_FMT);
        LocalDate today = LocalDate.now();
        long count = aiDiaryUsageRepository.countByMember_IdAndUsageTypeAndCalledAtBetween(
                userId, USAGE_TYPE,
                LocalDateTime.of(today, LocalTime.MIDNIGHT),
                LocalDateTime.of(today, LocalTime.MAX));
        if (count >= DAILY_LIMIT) throw AiRateLimitException.dashboardRefreshLimitExceeded();

        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Pet pet = petId != null ? petRepository.findById(petId).orElse(null) : null;

        String context = buildContext(userId, petId, yearMonth);
        String aiJson = geminiClient.generateText("월별 반려동물 리포트를 JSON으로 생성해주세요:\n" + context);

        String finalYearMonth = yearMonth;
        DashboardReport report = (petId != null
                ? dashboardReportRepository.findByUser_IdAndPet_IdAndReportYearMonth(userId, petId, yearMonth)
                : dashboardReportRepository.findByUser_IdAndPetIsNullAndReportYearMonth(userId, yearMonth))
                .orElseGet(() -> DashboardReport.builder().user(member).pet(pet).reportYearMonth(finalYearMonth).build());

        report.updateContent(aiJson, null, null, null, null, null);
        dashboardReportRepository.save(report);

        aiDiaryUsageRepository.save(AiDiaryUsage.builder()
                .member(member).targetDate(today)
                .calledAt(LocalDateTime.now()).usageType(USAGE_TYPE)
                .build());

        return AiReportResponse.from(report);
    }

    private String buildContext(UUID userId, UUID petId, String yearMonth) {
        return "yearMonth=" + yearMonth + ", userId=" + userId + (petId != null ? ", petId=" + petId : "");
    }
}
