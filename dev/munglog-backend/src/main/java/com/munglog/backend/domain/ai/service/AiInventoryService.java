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

/**
 * AI 재고 분석 서비스.
 * 반려동물 용품 이미지를 AI(Gemini)로 분석하여 제품 정보를 자동 추출하는 서비스 클래스.
 * 하루 최대 10회 호출로 제한하며, 초과 시 AiRateLimitException을 발생시킨다.
 * 주요 기능: 용품 이미지 OCR → 제품명·용량·만료일 등 구조화된 정보 추출
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiInventoryService {

    /** AI 재고 분석의 하루 최대 호출 횟수 */
    private static final int DAILY_LIMIT = 10;

    /** 사용량 테이블에 기록할 기능 구분 코드 */
    private static final String USAGE_TYPE = "INVENTORY";

    private final GeminiClient geminiClient;
    private final MemberRepository memberRepository;
    private final AiDiaryUsageRepository aiDiaryUsageRepository;
    private final ObjectMapper objectMapper;

    /**
     * [목적] 용품 이미지를 AI로 분석하여 제품 정보를 추출한다.
     * [설명] 오늘 날짜 기준 사용 횟수를 확인하고 일일 한도를 초과하면 예외를 던진다.
     *        이미지를 Base64로 변환 후 Gemini OCR → 텍스트 기반 구조화 추출 두 단계를 거친다.
     *        분석 완료 후 사용 이력을 기록한다.
     *
     * @param userId 요청 사용자 UUID
     * @param files  분석할 용품 이미지 파일 목록
     * @return 제품명, 용량, 카테고리 등이 담긴 분석 결과 DTO
     * @throws AiRateLimitException 일일 호출 한도(10회)를 초과한 경우
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
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

    /**
     * [목적] MultipartFile 목록을 Base64 인코딩 문자열 목록으로 변환한다.
     * [설명] 변환 실패한 파일은 경고 로그만 남기고 결과에서 제외한다.
     *
     * @param files 변환할 이미지 파일 목록
     * @return Base64 인코딩된 이미지 문자열 목록
     */
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

    /**
     * [목적] AI 기능 사용 이력을 데이터베이스에 기록한다.
     * [설명] 일일 한도 확인에 사용되므로, 분석 성공 후 반드시 호출해야 한다.
     *
     * @param member 사용한 회원 엔티티
     * @param today  사용 날짜
     */
    private void recordUsage(Member member, LocalDate today) {
        aiDiaryUsageRepository.save(AiDiaryUsage.builder()
                .member(member).targetDate(today)
                .calledAt(LocalDateTime.now()).usageType(USAGE_TYPE)
                .build());
    }
}
