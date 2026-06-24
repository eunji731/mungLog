package com.munglog.backend.domain.inventory.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class InventoryItemRequest {
    private String name;
    private String category;
    private String brand;
    private String flavor;
    private String purchaseDate;
    private String expiryDate;
    private String ingredients;
    private String material;
    private String size;
    private String storageMethod;
    private Integer rating;
    private Integer stock;
    private String price;
}
