package com.munglog.backend.domain.dashboard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.munglog.backend.common.ai.GeminiClient;
import com.munglog.backend.common.exception.AiRateLimitException;
import com.munglog.backend.domain.ai.domain.AiDiaryUsage;
import com.munglog.backend.domain.ai.repository.AiDiaryUsageRepository;
import com.munglog.backend.domain.dashboard.domain.DashboardReport;
import com.munglog.backend.domain.dashboard.dto.AiReportResponse;
import com.munglog.backend.domain.dashboard.repository.DashboardReportRepository;
import com.munglog.backend.domain.family.service.FamilyGroupService;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import com.munglog.backend.domain.memory.domain.Memory;
import com.munglog.backend.domain.memory.domain.MemoryMoment;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiDashboardService {

    private static final int DAILY_LIMIT = 3;
    private static final String USAGE_TYPE = "DASHBOARD";
    private static final DateTimeFormatter YEAR_MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final GeminiClient geminiClient;
    private final MemberRepository memberRepository;
    private final PetRepository petRepository;
    private final MemoryRepository memoryRepository;
    private final DashboardReportRepository dashboardReportRepository;
    private final AiDiaryUsageRepository aiDiaryUsageRepository;
    private final FamilyGroupService familyGroupService;

    @Transactional(readOnly = true)
    public AiReportResponse getReport(UUID userId, UUID petId, String yearMonth) {
        if (yearMonth == null) yearMonth = LocalDate.now().format(YEAR_MONTH_FMT);
        DashboardReport report = petId != null
                ? dashboardReportRepository.findByUser_IdAndPet_IdAndReportYearMonth(userId, petId, yearMonth).orElse(null)
                : dashboardReportRepository.findByUser_IdAndPetIsNullAndReportYearMonth(userId, yearMonth).orElse(null);
        return AiReportResponse.from(report, countRecords(userId, petId, yearMonth), remainingRefreshCount(userId));
    }

    @Transactional
    public AiReportResponse refreshReport(UUID userId, UUID petId, String yearMonth) {
        if (yearMonth == null) yearMonth = LocalDate.now().format(YEAR_MONTH_FMT);

        if (remainingRefreshCount(userId) <= 0) throw AiRateLimitException.dashboardRefreshLimitExceeded();

        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Pet pet = petId != null ? petRepository.findById(petId).orElse(null) : null;

        String context = buildContext(userId, petId, yearMonth);
        String prompt = buildPrompt(context);
        String aiJson = geminiClient.generateText(prompt);

        String finalYearMonth = yearMonth;
        DashboardReport report = (petId != null
                ? dashboardReportRepository.findByUser_IdAndPet_IdAndReportYearMonth(userId, petId, yearMonth)
                : dashboardReportRepository.findByUser_IdAndPetIsNullAndReportYearMonth(userId, yearMonth))
                .orElseGet(() -> DashboardReport.builder().user(member).pet(pet).reportYearMonth(finalYearMonth).build());

        parseAndUpdate(report, aiJson);
        dashboardReportRepository.save(report);

        aiDiaryUsageRepository.save(AiDiaryUsage.builder()
                .member(member).targetDate(LocalDate.now())
                .calledAt(LocalDateTime.now()).usageType(USAGE_TYPE)
                .build());

        return AiReportResponse.from(report, countRecords(userId, petId, yearMonth), remainingRefreshCount(userId));
    }

    private void parseAndUpdate(DashboardReport report, String aiJson) {
        try {
            JsonNode root = MAPPER.readTree(aiJson);
            String monthlyReport = nodeToString(root.get("monthlyReport"));
            String personalityInsight = nodeToString(root.get("personalityInsight"));
            String activityInsight = nodeToString(root.get("activityInsight"));
            String locationInsight = nodeToString(root.get("locationInsight"));
            String guardianMessage = root.has("guardianMessage") ? root.get("guardianMessage").asText(null) : null;
            String nextSuggestion = root.has("nextSuggestion") ? root.get("nextSuggestion").asText(null) : null;
            report.updateContent(monthlyReport, personalityInsight, activityInsight, locationInsight, guardianMessage, nextSuggestion);
        } catch (Exception e) {
            log.error("AI 리포트 JSON 파싱 실패, 원본 저장", e);
            report.updateContent(aiJson, null, null, null, null, null);
        }
    }

    private String nodeToString(JsonNode node) {
        if (node == null || node.isNull()) return null;
        return node.toString();
    }

    private String buildPrompt(String context) {
        return """
반려동물 월간 일기 리포트를 JSON으로 생성해주세요.
아래 규칙을 지키세요:
- 반드시 JSON만 출력 (설명 텍스트 금지)
- 일기 데이터의 [통계] 수치를 locationInsight와 activityInsight에 그대로 반영
- personalityInsight.type은 ACTIVE/CALM/SOCIAL/INDOOR 중 하나
- activityInsight.level은 GREAT/NORMAL/WATCH/WARNING/UNKNOWN 중 하나
- activityInsight.trend는 UP/STABLE/DOWN/UNKNOWN 중 하나
- locationInsight.verdict는 VARIED/FOCUSED/ROUTINE/LOW_DATA 중 하나
- highlights는 실제 일기에서 가장 인상적인 순간 1~3개 선택

{
  "monthlyReport": {
    "headline": "이달을 표현하는 짧고 감성적인 제목",
    "narrative": "이달의 반려동물 이야기를 2~3문장으로 생생하게",
    "highlights": [{"title": "특별한 순간 제목", "date": "YYYY-MM-DD", "reason": "이 순간을 선택한 이유"}],
    "tags": ["#태그1", "#태그2", "#태그3"]
  },
  "personalityInsight": {
    "type": "ACTIVE",
    "label": "활발한 탐험가",
    "message": "이달 일기를 바탕으로 한 성향 설명 한 문장"
  },
  "activityInsight": {
    "averageEnergy": null,
    "recentAverage": null,
    "previousAverage": null,
    "diff": null,
    "trend": "STABLE",
    "level": "NORMAL",
    "confidence": "LOW",
    "message": "이달 활동 수준에 대한 따뜻한 분석 메시지"
  },
  "locationInsight": {
    "verdict": "LOW_DATA",
    "placeRecordCount": 0,
    "uniquePlaceCount": 0,
    "topPlace": null,
    "message": "이달 장소 패턴에 대한 분석 메시지"
  },
  "guardianMessage": "보호자에게 전하는 따뜻한 메시지 한 문장",
  "nextSuggestion": "다음 달 해보면 좋을 구체적인 활동 한 문장"
}

일기 데이터:
""" + context;
    }

    private String buildContext(UUID userId, UUID petId, String yearMonth) {
        LocalDate start = LocalDate.parse(yearMonth + "-01");
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        List<Memory> memories = memoryRepository.findWithMomentsByGroupAndDateRange(groupId, start, end);

        // 실제 통계 계산
        List<String> allLocations = new ArrayList<>();
        double totalEnergy = 0;
        int energyCount = 0;

        for (Memory m : memories) {
            for (MemoryMoment moment : m.getMoments()) {
                if (moment.getLocationName() != null) allLocations.add(moment.getLocationName());
                if (moment.getEnergyLevel() != null) {
                    int e = switch (moment.getEnergyLevel()) {
                        case "HIGH" -> 3; case "MEDIUM" -> 2; case "LOW" -> 1; default -> 0;
                    };
                    if (e > 0) { totalEnergy += e; energyCount++; }
                }
            }
        }

        long placeRecordCount = allLocations.size();
        long uniquePlaceCount = allLocations.stream().distinct().count();
        String topPlace = allLocations.stream()
                .collect(Collectors.groupingBy(l -> l, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
        double avgEnergy = energyCount > 0 ? totalEnergy / energyCount : 0;

        StringBuilder sb = new StringBuilder();
        sb.append("기록 기간: ").append(yearMonth).append(", 총 ").append(memories.size()).append("개 일기");
        sb.append("\n[통계] 외출 ").append(placeRecordCount).append("회, 방문 장소 ").append(uniquePlaceCount).append("곳");
        if (topPlace != null) sb.append(", 가장 많이 간 곳: ").append(topPlace);
        if (avgEnergy > 0) sb.append(", 평균 활동 에너지: ").append(String.format("%.1f", avgEnergy)).append("/3.0");

        for (Memory m : memories) {
            sb.append("\n\n[").append(m.getMemoryDate()).append("]");
            if (m.getAiTitle() != null) sb.append(" ").append(m.getAiTitle());
            if (m.getSummary() != null) sb.append("\n  요약: ").append(m.getSummary());
            if (m.getLocation() != null) sb.append("\n  장소: ").append(m.getLocation());
            if (m.getWeather() != null) sb.append(" / 날씨: ").append(m.getWeather());
            for (MemoryMoment moment : m.getMoments()) {
                sb.append("\n  - ").append(moment.getAiTitle() != null ? moment.getAiTitle() : moment.getCategory());
                if (moment.getLocationName() != null) sb.append(" @ ").append(moment.getLocationName());
                if (moment.getEnergyLevel() != null) sb.append(" [에너지:").append(moment.getEnergyLevel()).append("]");
                if (moment.getAiContent() != null) {
                    String snippet = moment.getAiContent();
                    if (snippet.length() > 100) snippet = snippet.substring(0, 100) + "...";
                    sb.append("\n    ").append(snippet);
                }
            }
        }
        return sb.toString();
    }

    private int countRecords(UUID userId, UUID petId, String yearMonth) {
        try {
            LocalDate start = LocalDate.parse(yearMonth + "-01");
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            UUID groupId = familyGroupService.getGroupIdByUserId(userId);
            if (petId != null) {
                return (int) memoryRepository.countByGroupAndDateRangeAndPet(groupId, petId, start, end);
            }
            return memoryRepository.findByGroupIdAndMemoryDateBetween(groupId, start, end).size();
        } catch (Exception e) {
            return 0;
        }
    }

    private int remainingRefreshCount(UUID userId) {
        LocalDate today = LocalDate.now();
        long used = aiDiaryUsageRepository.countByMember_IdAndUsageTypeAndCalledAtBetween(
                userId, USAGE_TYPE,
                LocalDateTime.of(today, LocalTime.MIDNIGHT),
                LocalDateTime.of(today, LocalTime.MAX));
        return (int) Math.max(0, DAILY_LIMIT - used);
    }
}
