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

/**
 * AI 대시보드 리포트 서비스.
 * Gemini AI를 활용하여 반려동물의 월간 활동 리포트를 생성하고 관리하는 클래스.
 * 주요 기능: 월간 리포트 조회, AI 리포트 갱신 (하루 최대 3회 제한)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiDashboardService {

    /** 하루 AI 리포트 갱신 최대 횟수 */
    private static final int DAILY_LIMIT = 3;

    /** AI 사용량 추적을 위한 용도 구분 코드 */
    private static final String USAGE_TYPE = "DASHBOARD";

    /** 연월 포맷터 (예: "2025-07") */
    private static final DateTimeFormatter YEAR_MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    /** AI 응답 JSON 파싱용 ObjectMapper */
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final GeminiClient geminiClient;
    private final MemberRepository memberRepository;
    private final PetRepository petRepository;
    private final MemoryRepository memoryRepository;
    private final DashboardReportRepository dashboardReportRepository;
    private final AiDiaryUsageRepository aiDiaryUsageRepository;
    private final FamilyGroupService familyGroupService;

    /**
     * [목적] 저장된 AI 월간 리포트를 조회한다.
     * [설명] 이미 생성된 리포트가 있으면 캐시된 결과를 반환한다.
     *        리포트가 없으면 hasData = false인 응답을 반환한다.
     *
     * @param userId    사용자 UUID
     * @param petId     반려동물 UUID (null이면 전체 기준)
     * @param yearMonth 조회 연월 (null이면 현재 월)
     * @return AI 리포트 응답
     */
    @Transactional(readOnly = true)
    public AiReportResponse getReport(UUID userId, UUID petId, String yearMonth) {
        if (yearMonth == null) yearMonth = LocalDate.now().format(YEAR_MONTH_FMT);
        DashboardReport report = petId != null
                ? dashboardReportRepository.findByUser_IdAndPet_IdAndReportYearMonth(userId, petId, yearMonth).orElse(null)
                : dashboardReportRepository.findByUser_IdAndPetIsNullAndReportYearMonth(userId, yearMonth).orElse(null);
        return AiReportResponse.from(report, countRecords(userId, petId, yearMonth), remainingRefreshCount(userId));
    }

    /**
     * [목적] Gemini AI를 호출하여 월간 리포트를 새로 생성(갱신)한다.
     * [설명] 하루 DAILY_LIMIT(3)회를 초과하면 AiRateLimitException이 발생한다.
     *        기존 리포트가 있으면 내용을 덮어쓰고, 없으면 새로 생성한다.
     *        AI 호출 기록은 AiDiaryUsage 테이블에 저장된다.
     *
     * @param userId    사용자 UUID
     * @param petId     반려동물 UUID (null이면 전체 기준)
     * @param yearMonth 조회 연월 (null이면 현재 월)
     * @return 새로 생성된 AI 리포트 응답
     * @throws AiRateLimitException 하루 갱신 한도 초과 시 발생
     */
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

    /**
     * [목적] AI 응답 JSON을 파싱하여 리포트 엔티티에 반영한다.
     * [설명] JSON 파싱 실패 시 원본 문자열을 monthlyReport에 저장하고 나머지는 null로 처리한다.
     *
     * @param report 업데이트할 DashboardReport 엔티티
     * @param aiJson AI가 반환한 JSON 문자열
     */
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

    /**
     * [목적] JsonNode를 JSON 문자열로 변환한다.
     * [설명] null 또는 null 노드이면 null을 반환한다.
     *
     * @param node 변환할 JsonNode
     * @return JSON 문자열 또는 null
     */
    private String nodeToString(JsonNode node) {
        if (node == null || node.isNull()) return null;
        return node.toString();
    }

    /**
     * [목적] AI에게 전달할 리포트 생성 프롬프트를 구성한다.
     * [설명] JSON 형식의 구조화된 응답을 요청하며, 출력 규칙과 형식을 상세히 지정한다.
     *
     * @param context 반려동물 일기 데이터 컨텍스트 문자열
     * @return 완성된 프롬프트 문자열
     */
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

    /**
     * [목적] AI 프롬프트에 포함할 일기 데이터 컨텍스트를 구성한다.
     * [설명] 해당 월의 기억(Memory) 목록을 조회하고, 외출 통계·평균 에너지를 계산하여
     *        텍스트로 요약한다. AI가 통계 수치를 리포트에 반영할 수 있도록 [통계] 섹션을 포함한다.
     *
     * @param userId    사용자 UUID
     * @param petId     반려동물 UUID (null이면 전체 기준)
     * @param yearMonth 조회 연월
     * @return 컨텍스트 문자열
     */
    private String buildContext(UUID userId, UUID petId, String yearMonth) {
        LocalDate start = LocalDate.parse(yearMonth + "-01");
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        List<Memory> memories = memoryRepository.findWithMomentsByGroupAndDateRange(groupId, start, end);

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

    /**
     * [목적] 특정 월의 기록(Memory) 수를 반환한다.
     * [설명] petId가 있으면 해당 반려동물 기준, 없으면 그룹 전체 기준으로 카운트한다.
     *        조회 실패 시 0을 반환한다.
     *
     * @param userId    사용자 UUID
     * @param petId     반려동물 UUID (null이면 전체)
     * @param yearMonth 조회 연월
     * @return 기록 수 (실패 시 0)
     */
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

    /**
     * [목적] 오늘 남은 AI 리포트 갱신 횟수를 반환한다.
     * [설명] DAILY_LIMIT(3)에서 오늘 이미 사용한 횟수를 빼서 반환한다.
     *        음수가 되지 않도록 Math.max(0, ...)를 적용한다.
     *
     * @param userId 사용자 UUID
     * @return 오늘 남은 갱신 횟수 (0 이상)
     */
    private int remainingRefreshCount(UUID userId) {
        LocalDate today = LocalDate.now();
        long used = aiDiaryUsageRepository.countByMember_IdAndUsageTypeAndCalledAtBetween(
                userId, USAGE_TYPE,
                LocalDateTime.of(today, LocalTime.MIDNIGHT),
                LocalDateTime.of(today, LocalTime.MAX));
        return (int) Math.max(0, DAILY_LIMIT - used);
    }
}
