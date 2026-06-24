package com.munglog.backend.domain.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.munglog.backend.common.ai.GeminiClient;
import com.munglog.backend.common.exception.AiRateLimitException;
import com.munglog.backend.domain.ai.domain.AiDiaryUsage;
import com.munglog.backend.domain.ai.dto.AnalyzeProductResult;
import com.munglog.backend.domain.ai.repository.AiDiaryUsageRepository;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiInventoryService {

    private static final int DAILY_LIMIT = 10;
    private static final String USAGE_TYPE = "INVENTORY";

    private final GeminiClient geminiClient;
    private final MemberRepository memberRepository;
    private final AiDiaryUsageRepository aiDiaryUsageRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public AnalyzeProductResult analyzeProduct(UUID userId, List<MultipartFile> files) {
        LocalDate today = LocalDate.now();
        long count = aiDiaryUsageRepository.countByMember_IdAndUsageTypeAndCalledAtBetween(
                userId, USAGE_TYPE,
                LocalDateTime.of(today, LocalTime.MIDNIGHT),
                LocalDateTime.of(today, LocalTime.MAX));
        if (count >= DAILY_LIMIT) throw AiRateLimitException.dailyLimitExceeded();

        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<String> base64Images = toBase64(files);
        String ocrText = geminiClient.ocrProductImages(base64Images);
        AnalyzeProductResult result = geminiClient.extractProductInfoFromText(ocrText);

        recordUsage(member, today);

        return result;
    }

    private List<String> toBase64(List<MultipartFile> files) {
        List<String> result = new ArrayList<>();
        for (MultipartFile file : files) {
            try {
                result.add(Base64.getEncoder().encodeToString(file.getBytes()));
            } catch (IOException e) {
                log.warn("이미지 변환 실패: {}", file.getOriginalFilename(), e);
            }
        }
        return result;
    }

    private void recordUsage(Member member, LocalDate today) {
        aiDiaryUsageRepository.save(AiDiaryUsage.builder()
                .member(member).targetDate(today)
                .calledAt(LocalDateTime.now()).usageType(USAGE_TYPE)
                .build());
    }
}
