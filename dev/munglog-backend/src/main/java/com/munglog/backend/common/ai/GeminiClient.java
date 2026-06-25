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

    public DailyLogResponse analyzeImages(List<String> base64Images, List<String> fileNames, String prompt) {
        try {
            List<Map<String, Object>> parts = new ArrayList<>();
            parts.add(Map.of("text", prompt));
            for (int i = 0; i < base64Images.size(); i++) {
                String fileName = i < fileNames.size() ? fileNames.get(i) : "image" + i + ".jpg";
                parts.add(Map.of("text", "[사진 파일명: " + fileName + "]"));
                parts.add(Map.of("inline_data", Map.of("mime_type", "image/jpeg", "data", base64Images.get(i))));
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
