package com.munglog.backend.domain.inventory.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.family.domain.FamilyGroup;
import com.munglog.backend.domain.pet.domain.Pet;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tb_inventory_item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class InventoryItem extends BaseTimeEntity {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private FamilyGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id")
    private Pet pet;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private ItemCategory category;

    @Column(name = "brand")
    private String brand;

    @Column(name = "flavor")
    private String flavor;

    @Column(name = "production_date")
    private LocalDate productionDate;

    @Column(name = "expiry_date_text")
    private String expiryDateText;

    @Column(name = "expiry_date_specific")
    private LocalDate expiryDateSpecific;

    @Column(name = "opened_at")
    private LocalDate openedAt;

    // 성분 목록은 JSON 배열 문자열로 저장하고 서비스 계층에서 List<String>으로 변환합니다.
    @Column(name = "ingredients", columnDefinition = "TEXT")
    private String ingredients;

    @Column(name = "material")
    private String material;

    @Column(name = "size")
    private String size;

    @Enumerated(EnumType.STRING)
    @Column(name = "storage_method")
    private StorageMethod storageMethod;

    @Column(name = "suggested_usage", columnDefinition = "TEXT")
    private String suggestedUsage;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "stock")
    private Integer stock;

    @Column(name = "price", precision = 12, scale = 2)
    private BigDecimal price;

    @Builder.Default
    @Column(name = "is_feeding")
    private Boolean isFeeding = false;

    @Column(name = "added_at")
    private LocalDate addedAt;

    public void update(String name, ItemCategory category, String brand, String flavor,
                       LocalDate productionDate, String expiryDateText, LocalDate expiryDateSpecific,
                       LocalDate openedAt, String ingredients, String material, String size,
                       StorageMethod storageMethod, String suggestedUsage,
                       Integer rating, Integer stock, BigDecimal price, Pet pet) {
        this.name = name;
        this.category = category;
        this.brand = brand;
        this.flavor = flavor;
        this.productionDate = productionDate;
        this.expiryDateText = expiryDateText;
        this.expiryDateSpecific = expiryDateSpecific;
        this.openedAt = openedAt;
        this.ingredients = ingredients;
        this.material = material;
        this.size = size;
        this.storageMethod = storageMethod;
        this.suggestedUsage = suggestedUsage;
        this.rating = rating;
        this.stock = stock;
        this.price = price;
        this.pet = pet;
    }

    public void toggleFeeding() {
        this.isFeeding = !Boolean.TRUE.equals(this.isFeeding);
    }

    public void adjustStock(int delta) {
        int current = this.stock != null ? this.stock : 0;
        this.stock = Math.max(0, current + delta);
    }
}
