package com.munglog.backend.common.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.munglog.backend.domain.ai.dto.AnalyzeProductResult;
import com.munglog.backend.domain.ai.dto.DailyLogResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    @Value("${gemini.url}")
    private String baseUrl;

    public DailyLogResponse analyzeImages(List<String> base64Images, String prompt) {
        try {
            List<Map<String, Object>> parts = new ArrayList<>();
            parts.add(Map.of("text", prompt));
            for (String b64 : base64Images) {
                parts.add(Map.of("inline_data", Map.of("mime_type", "image/jpeg", "data", b64)));
            }
            String raw = callGemini(parts);
            String json = extractJson(raw);
            return objectMapper.readValue(json, DailyLogResponse.class);
        } catch (Exception e) {
            log.error("Gemini 이미지 분석 실패", e);
            throw new RuntimeException("AI 분석 중 오류가 발생했습니다.", e);
        }
    }

    public String ocrProductImages(List<String> base64Images) {
        String prompt = "이 제품 이미지들에서 보이는 모든 텍스트를 그대로 추출해줘. 특히 성분표, 영양성분, 제품명, 브랜드, 용량, 유통기한, 보관방법을 중심으로 추출해줘.";
        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));
        for (String b64 : base64Images) {
            parts.add(Map.of("inline_data", Map.of("mime_type", "image/jpeg", "data", b64)));
        }
        return callGemini(parts);
    }

    public AnalyzeProductResult extractProductInfoFromText(String ocrText) {
        String prompt = """
                다음은 반려동물 제품 이미지에서 추출한 텍스트입니다.
                이 텍스트를 분석하여 제품 정보를 JSON 형식으로 추출해주세요.

                추출할 텍스트:
                """ + ocrText + """

                반드시 아래 JSON 형식으로만 응답 (다른 텍스트 금지):
                {
                  "category": {"value": "FOOD|SNACK|TOY|HEALTH|CLOTHES|ETC", "confidence": 0.9},
                  "name": {"value": "제품명", "confidence": 0.9},
                  "brand": {"value": "브랜드명", "confidence": 0.9},
                  "flavor": {"value": "맛/향", "confidence": 0.7},
                  "ingredients": {"value": ["성분1", "성분2"], "confidence": 0.8},
                  "storageMethod": {"value": "ROOM_TEMP|REFRIGERATED|FROZEN", "confidence": 0.8},
                  "suggestedUsage": {"value": "급여 방법", "confidence": 0.7},
                  "expiryDateText": {"value": "유통기한 텍스트", "confidence": 0.8}
                }
                """;
        try {
            List<Map<String, Object>> parts = List.of(Map.of("text", prompt));
            String raw = callGemini(parts);
            String json = extractJson(raw);
            return objectMapper.readValue(json, AnalyzeProductResult.class);
        } catch (Exception e) {
            log.error("제품 정보 추출 실패", e);
            throw new RuntimeException("제품 정보 추출 중 오류가 발생했습니다.", e);
        }
    }

    public String generateText(String prompt) {
        List<Map<String, Object>> parts = List.of(Map.of("text", prompt));
        String raw = callGemini(parts);
        return extractJson(raw);
    }

    private String callGemini(List<Map<String, Object>> parts) {
        String url = baseUrl + "/models/" + model + ":generateContent?key=" + apiKey;
        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", parts)),
                "generationConfig", Map.of("temperature", 0.7, "maxOutputTokens", 8192)
        );
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

    private String extractJson(String text) {
        if (text == null) return "{}";
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start >= 0 && end > start) return text.substring(start, end + 1);
        return text;
    }
}
