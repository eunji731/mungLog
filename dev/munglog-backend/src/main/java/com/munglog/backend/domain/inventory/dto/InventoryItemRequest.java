package com.munglog.backend.domain.inventory.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * 용품 등록·수정 요청 DTO.
 * 클라이언트가 용품을 등록하거나 수정할 때 전달하는 데이터 클래스.
 * 날짜 필드(productionDate, expiryDateSpecific, openedAt)는 "yyyy-MM-dd" 형식의 문자열로 받고
 * 서비스 계층에서 LocalDate로 변환한다.
 */
@Getter
@NoArgsConstructor
public class InventoryItemRequest {
    /** 용품 이름 */
    private String name;
    /** 카테고리 (ItemCategory enum 이름) */
    private String category;
    /** 브랜드명 */
    private String brand;
    /** 맛/향 */
    private String flavor;
    /** 제조일 ("yyyy-MM-dd") */
    private String productionDate;
    /** 유통기한 텍스트 (예: "2025년 12월") */
    private String expiryDateText;
    /** 유통기한 날짜 ("yyyy-MM-dd") */
    private String expiryDateSpecific;
    /** 개봉일 ("yyyy-MM-dd") */
    private String openedAt;
    /** 성분 목록 */
    private List<String> ingredients;
    /** 소재/재질 */
    private String material;
    /** 사이즈 */
    private String size;
    /** 보관 방법 (StorageMethod enum 이름) */
    private String storageMethod;
    /** 권장 급여량/사용법 */
    private String suggestedUsage;
    /** 평점 (1~5) */
    private Integer rating;
    /** 재고 수량 */
    private Integer stock;
    /** 가격 (문자열로 수신 후 BigDecimal로 변환) */
    private String price;
    /** 연결 반려동물 UUID (없으면 null) */
    private UUID petId;
    /** 수정 시 삭제할 첨부파일 ID 목록 */
    private List<UUID> deletedFileIds;
}
