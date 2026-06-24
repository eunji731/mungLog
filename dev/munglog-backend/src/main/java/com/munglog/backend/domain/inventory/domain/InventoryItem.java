package com.munglog.backend.domain.inventory.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.member.domain.Member;
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
    @JoinColumn(name = "user_id", nullable = false)
    private Member user;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private ItemCategory category;

    @Column(name = "brand")
    private String brand;

    @Column(name = "flavor")
    private String flavor;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "ingredients", columnDefinition = "TEXT")
    private String ingredients;

    @Column(name = "material")
    private String material;

    @Column(name = "size")
    private String size;

    @Enumerated(EnumType.STRING)
    @Column(name = "storage_method")
    private StorageMethod storageMethod;

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
                       LocalDate purchaseDate, LocalDate expiryDate, String ingredients,
                       String material, String size, StorageMethod storageMethod,
                       Integer rating, Integer stock, BigDecimal price) {
        this.name = name;
        this.category = category;
        this.brand = brand;
        this.flavor = flavor;
        this.purchaseDate = purchaseDate;
        this.expiryDate = expiryDate;
        this.ingredients = ingredients;
        this.material = material;
        this.size = size;
        this.storageMethod = storageMethod;
        this.rating = rating;
        this.stock = stock;
        this.price = price;
    }

    public void toggleFeeding() {
        this.isFeeding = !Boolean.TRUE.equals(this.isFeeding);
    }
}
