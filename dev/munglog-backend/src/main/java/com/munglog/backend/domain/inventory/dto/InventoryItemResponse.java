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

@Builder
public record InventoryItemResponse(
        UUID id,
        String name,
        ItemCategory category,
        String brand,
        String flavor,
        LocalDate purchaseDate,
        LocalDate expiryDate,
        String ingredients,
        String material,
        String size,
        StorageMethod storageMethod,
        Integer rating,
        Integer stock,
        BigDecimal price,
        Boolean isFeeding,
        LocalDate addedAt,
        List<PhotoInfo> photos
) {
    @Builder
    public record PhotoInfo(UUID id, String url) {}

    public static InventoryItemResponse from(InventoryItem item, List<FileResponse> files) {
        List<PhotoInfo> photos = files.stream()
                .map(f -> PhotoInfo.builder().id(f.getId()).url(f.getFileUrl()).build())
                .toList();

        return InventoryItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .category(item.getCategory())
                .brand(item.getBrand())
                .flavor(item.getFlavor())
                .purchaseDate(item.getPurchaseDate())
                .expiryDate(item.getExpiryDate())
                .ingredients(item.getIngredients())
                .material(item.getMaterial())
                .size(item.getSize())
                .storageMethod(item.getStorageMethod())
                .rating(item.getRating())
                .stock(item.getStock())
                .price(item.getPrice())
                .isFeeding(item.getIsFeeding())
                .addedAt(item.getAddedAt())
                .photos(photos)
                .build();
    }
}
