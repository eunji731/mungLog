package com.munglog.backend.common.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.munglog.backend.common.ai.dto.GeminiContent;
import com.munglog.backend.common.ai.dto.GeminiGenerationConfig;
import com.munglog.backend.common.ai.dto.GeminiInlineData;
import com.munglog.backend.common.ai.dto.GeminiPart;
import com.munglog.backend.common.ai.dto.GeminiRequest;
import com.munglog.backend.domain.ai.dto.AnalyzeProductResult;
import com.munglog.backend.domain.ai.dto.DailyLogResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Google Gemini AI API와 통신하는 클라이언트 컴포넌트.
 * 이미지 분석, OCR, 텍스트 생성 등 AI 기능을 제공한다.
 * application.yml의 gemini.* 설정값을 사용한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /** Gemini API 인증 키 */
    @Value("${gemini.api-key}")
    private String apiKey;

    /** 사용할 Gemini 모델 이름 (예: gemini-1.5-flash) */
    @Value("${gemini.model}")
    private String model;

    /** Gemini API 기본 URL */
    @Value("${gemini.url}")
    private String baseUrl;

    /**
     * [목적] 반려동물 사진들을 AI로 분석하여 일기 형태의 데이터를 생성한다.
     * [설명] base64로 인코딩된 이미지 목록과 프롬프트를 Gemini에 전달하고,
     *        응답 JSON을 DailyLogResponse 객체로 파싱하여 반환한다.
     *
     * @param base64Images base64 인코딩된 이미지 목록
     * @param fileNames    각 이미지의 파일명 (이미지 순서와 대응)
     * @param prompt       AI에게 전달할 분석 지시 프롬프트
     * @return AI가 분석한 일기 데이터
     * @throws RuntimeException Gemini API 호출 또는 응답 파싱 실패 시
     */
    public DailyLogResponse analyzeImages(List<String> base64Images, List<String> fileNames, String prompt) {
        try {
            // 프롬프트 텍스트를 먼저 넣고, 그 다음 이미지마다 "파일명 텍스트 + 이미지" 순서로 넣는다.
            List<GeminiPart> parts = new ArrayList<>();
            parts.add(new GeminiPart(prompt, null));
            for (int i = 0; i < base64Images.size(); i++) {
                String fileName = i < fileNames.size() ? fileNames.get(i) : "image" + i + ".jpg";
                parts.add(new GeminiPart("[사진 파일명: " + fileName + "]", null));
                parts.add(new GeminiPart(null, new GeminiInlineData("image/jpeg", base64Images.get(i))));
            }
            String raw = callGemini(parts);
            String json = extractJson(raw);
            return objectMapper.readValue(json, DailyLogResponse.class);
        } catch (Exception e) {
            log.error("Gemini 이미지 분석 실패", e);
            throw new RuntimeException("AI 분석 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * [목적] 제품 이미지에서 텍스트(OCR)를 추출한다.
     * [설명] 반려동물 제품 이미지를 Gemini에 전달하여 성분표, 영양정보, 브랜드 등의
     *        텍스트를 원문 그대로 추출한다.
     *
     * @param base64Images base64 인코딩된 제품 이미지 목록
     * @return 이미지에서 추출된 원문 텍스트
     */
    public String ocrProductImages(List<String> base64Images) {
        String prompt = "이 제품 이미지들에서 보이는 모든 텍스트를 그대로 추출해줘. 특히 성분표, 영양성분, 제품명, 브랜드, 용량, 유통기한, 보관방법을 중심으로 추출해줘.";
        List<GeminiPart> parts = new ArrayList<>();
        parts.add(new GeminiPart(prompt, null));
        for (String b64 : base64Images) {
            parts.add(new GeminiPart(null, new GeminiInlineData("image/jpeg", b64)));
        }
        return callGemini(parts);
    }

    /**
     * [목적] OCR로 추출된 텍스트에서 제품 정보를 구조화된 형태로 추출한다.
     * [설명] 원문 텍스트를 Gemini에 전달하여 제품명, 브랜드, 성분, 유통기한 등을
     *        JSON 형식으로 파싱하고 AnalyzeProductResult 객체로 반환한다.
     *
     * @param ocrText 제품 이미지에서 추출된 원문 텍스트
     * @return 구조화된 제품 정보 객체
     * @throws RuntimeException 제품 정보 추출 실패 시
     */
    public AnalyzeProductResult extractProductInfoFromText(String ocrText) {
        String prompt = """
                다음은 반려동물 제품 이미지에서 추출한 텍스트입니다.
                이 텍스트를 분석하여 제품 정보를 JSON 형식으로 추출해주세요.

                추출할 텍스트:
                """ + ocrText + """

                각 필드는 {"value": ..., "confidence": 0~1 사이 숫자, "candidates": [다른 가능성 있는 값들](선택)} 형태로 응답하세요.
                값을 알 수 없으면 value를 null로, confidence를 0으로 설정하세요.
                반드시 아래 JSON 형식으로만 응답 (다른 텍스트 금지):
                {
                  "category": {"value": "FOOD|SNACK|TOY|HEALTH|CLOTHES|ETC", "confidence": 0.9},
                  "name": {"value": "제품명", "confidence": 0.9, "candidates": []},
                  "brand": {"value": "브랜드명", "confidence": 0.9, "candidates": []},
                  "flavor": {"value": "맛/향", "confidence": 0.7, "candidates": []},
                  "ingredients": {"value": ["성분1", "성분2"], "confidence": 0.8},
                  "material": {"value": "재질 (장난감/의류류일 때)", "confidence": 0.5},
                  "size": {"value": "용량/크기", "confidence": 0.7, "candidates": []},
                  "storageMethod": {"value": "ROOM_TEMP|REFRIGERATED|FROZEN", "confidence": 0.8},
                  "productionDate": {"value": "YYYY-MM-DD 형식 제조일", "confidence": 0.6},
                  "expiryDateSpecific": {"value": "YYYY-MM-DD 형식 유통기한", "confidence": 0.6},
                  "expiryDateText": {"value": "유통기한 텍스트", "confidence": 0.8, "candidates": []},
                  "suggestedUsage": {"value": "급여/사용 방법", "confidence": 0.7, "candidates": []},
                  "reviewFields": ["확인이 필요한 필드명들"],
                  "warnings": ["분석 중 발견한 주의사항"]
                }
                """;
        try {
            List<GeminiPart> parts = List.of(new GeminiPart(prompt, null));
            String raw = callGemini(parts);
            String json = extractJson(raw);
            return objectMapper.readValue(json, AnalyzeProductResult.class);
        } catch (Exception e) {
            log.error("제품 정보 추출 실패", e);
            throw new RuntimeException("제품 정보 추출 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * [목적] 텍스트 프롬프트를 기반으로 Gemini에서 텍스트(JSON 포함)를 생성한다.
     *
     * @param prompt AI에게 전달할 프롬프트
     * @return AI가 생성한 텍스트 (JSON 부분만 추출됨)
     */
    public String generateText(String prompt) {
        List<GeminiPart> parts = List.of(new GeminiPart(prompt, null));
        String raw = callGemini(parts);
        return extractJson(raw);
    }

    /**
     * [목적] Gemini API에 실제 HTTP 요청을 보내고 응답 텍스트를 반환한다.
     * [설명] parts 목록을 요청 본문으로 구성하여 generateContent API를 호출하고,
     *        응답의 첫 번째 후보(candidate) 텍스트를 추출한다.
     *
     * @param parts 프롬프트와 이미지 데이터를 담은 리스트
     * @return Gemini가 생성한 원문 텍스트
     * @throws RuntimeException 응답 파싱 실패 시
     */
    private String callGemini(List<GeminiPart> parts) {
        String url = baseUrl + "/models/" + model + ":generateContent?key=" + apiKey;

        // 1) 옵션(생성 설정)을 만든다.
        GeminiGenerationConfig generationConfig = new GeminiGenerationConfig(0.7, 8192);

        // 2) parts를 담은 Content 1개를 만든다. (우리는 항상 Content를 1개만 사용한다)
        GeminiContent content = new GeminiContent(parts);

        // 3) 위 두 가지를 합쳐서 실제로 보낼 요청 본문(body)을 만든다.
        GeminiRequest body = new GeminiRequest(List.of(content), generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, new HttpEntity<>(body, headers), String.class);
        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.at("/candidates/0/content/parts/0/text").asText();
        } catch (Exception e) {
            throw new RuntimeException("Gemini 응답 파싱 실패", e);
        }
    }

    /**
     * [목적] AI 응답 텍스트에서 JSON 부분만 추출한다.
     * [설명] AI가 JSON 외에 추가 설명을 붙이는 경우가 있어, '{'와 '}' 사이의 내용만 잘라낸다.
     *
     * @param text AI 원문 응답 텍스트
     * @return 순수 JSON 문자열 (추출 실패 시 원문 반환)
     */
    private String extractJson(String text) {
        if (text == null) return "{}";
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start >= 0 && end > start) return text.substring(start, end + 1);
        return text;
    }
}
