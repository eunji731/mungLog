package com.munglog.backend.domain.inventory.dto;

import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.domain.inventory.domain.InventoryItem;
import com.munglog.backend.domain.inventory.domain.ItemCategory;
import com.munglog.backend.domain.inventory.domain.StorageMethod;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 용품 응답 DTO.
 * 클라이언트에 반환하는 용품 정보 레코드.
 * photo는 대표 이미지 URL(첫 번째), photos는 전체 이미지 목록이다.
 */
@Builder
public record InventoryItemResponse(
        /** 용품 고유 ID */
        UUID id,
        /** 용품 이름 */
        String name,
        /** 카테고리 */
        ItemCategory category,
        /** 브랜드명 */
        String brand,
        /** 맛/향 */
        String flavor,
        /** 제조일 */
        LocalDate productionDate,
        /** 유통기한 텍스트 */
        String expiryDateText,
        /** 유통기한 날짜 */
        LocalDate expiryDateSpecific,
        /** 개봉일 */
        LocalDate openedAt,
        /** 성분 목록 */
        List<String> ingredients,
        /** 소재/재질 */
        String material,
        /** 사이즈 */
        String size,
        /** 보관 방법 */
        StorageMethod storageMethod,
        /** 권장 급여량/사용법 */
        String suggestedUsage,
        /** 평점 */
        Integer rating,
        /** 재고 수량 */
        Integer stock,
        /** 가격 */
        BigDecimal price,
        /** 급여 중 여부 */
        Boolean isFeeding,
        /** 추가일 */
        LocalDate addedAt,
        /** 대표 이미지 URL (첫 번째 이미지) */
        String photo,
        /** 전체 이미지 목록 */
        List<PhotoInfo> photos,
        /** 연결 반려동물 UUID */
        UUID petId
) {
    /**
     * 용품 사진 정보 레코드.
     * 첨부파일 ID와 URL을 함께 반환해 삭제 요청 시 ID를 사용할 수 있도록 한다.
     */
    @Builder
    public record PhotoInfo(
            /** 첨부파일 UUID */
            UUID id,
            /** 이미지 접근 URL */
            String url
    ) {}

    /**
     * [목적] InventoryItem 엔티티와 첨부파일 목록으로 응답 DTO를 생성한다.
     *
     * @param item        용품 엔티티
     * @param files       첨부파일 응답 목록
     * @param ingredients 성분 목록 (JSON에서 역직렬화된 리스트)
     * @return 용품 응답 DTO
     */
    public static InventoryItemResponse from(InventoryItem item, List<FileResponse> files, List<String> ingredients) {
        List<PhotoInfo> photos = files.stream()
                .map(f -> PhotoInfo.builder().id(f.getId()).url(f.getFileUrl()).build())
                .toList();

        return InventoryItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .category(item.getCategory())
                .brand(item.getBrand())
                .flavor(item.getFlavor())
                .productionDate(item.getProductionDate())
                .expiryDateText(item.getExpiryDateText())
                .expiryDateSpecific(item.getExpiryDateSpecific())
                .openedAt(item.getOpenedAt())
                .ingredients(ingredients)
                .material(item.getMaterial())
                .size(item.getSize())
                .storageMethod(item.getStorageMethod())
                .suggestedUsage(item.getSuggestedUsage())
                .rating(item.getRating())
                .stock(item.getStock())
                .price(item.getPrice())
                .isFeeding(item.getIsFeeding())
                .addedAt(item.getAddedAt())
                .photo(photos.isEmpty() ? null : photos.get(0).url())
                .photos(photos)
                .petId(item.getPet() != null ? item.getPet().getId() : null)
                .build();
    }
}
