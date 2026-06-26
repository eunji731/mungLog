package com.munglog.backend.domain.inventory.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor
public class InventoryItemRequest {
    private String name;
    private String category;
    private String brand;
    private String flavor;
    private String productionDate;
    private String expiryDateText;
    private String expiryDateSpecific;
    private String openedAt;
    private List<String> ingredients;
    private String material;
    private String size;
    private String storageMethod;
    private String suggestedUsage;
    private Integer rating;
    private Integer stock;
    private String price;
    private UUID petId;
    private List<UUID> deletedFileIds;
}
