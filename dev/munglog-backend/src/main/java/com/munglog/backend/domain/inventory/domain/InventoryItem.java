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

/**
 * 반려동물 용품 엔티티.
 * 그룹에 속한 반려동물 관련 용품(사료·간식·장난감·의약품 등) 정보를 저장하는 엔티티 클래스.
 * 주요 기능: 용품 정보 저장, 전체 수정, 급여 상태 토글, 재고 조정
 */
@Entity
@Table(name = "tb_inventory_item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class InventoryItem extends BaseTimeEntity {

    /** 용품 고유 식별자 (UUID) */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 용품이 속한 가족 그룹 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private FamilyGroup group;

    /** 이 용품을 사용하는 반려동물 (없으면 null) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id")
    private Pet pet;

    /** 용품 이름 */
    @Column(name = "name", nullable = false)
    private String name;

    /** 용품 카테고리 (사료·간식·장난감 등) */
    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private ItemCategory category;

    /** 브랜드명 */
    @Column(name = "brand")
    private String brand;

    /** 맛·향 */
    @Column(name = "flavor")
    private String flavor;

    /** 제조일자 */
    @Column(name = "production_date")
    private LocalDate productionDate;

    /** 유통기한 텍스트 (예: "2025년 12월") */
    @Column(name = "expiry_date_text")
    private String expiryDateText;

    /** 유통기한 날짜 (정확한 날짜가 있는 경우) */
    @Column(name = "expiry_date_specific")
    private LocalDate expiryDateSpecific;

    /** 개봉일 */
    @Column(name = "opened_at")
    private LocalDate openedAt;

    /** 성분 목록 (JSON 배열 문자열로 저장, 서비스 계층에서 List<String>으로 변환) */
    @Column(name = "ingredients", columnDefinition = "TEXT")
    private String ingredients;

    /** 소재/재질 */
    @Column(name = "material")
    private String material;

    /** 사이즈 */
    @Column(name = "size")
    private String size;

    /** 보관 방법 (실온·냉장·냉동) */
    @Enumerated(EnumType.STRING)
    @Column(name = "storage_method")
    private StorageMethod storageMethod;

    /** 권장 급여량 또는 사용 방법 */
    @Column(name = "suggested_usage", columnDefinition = "TEXT")
    private String suggestedUsage;

    /** 사용자 평점 (1~5) */
    @Column(name = "rating")
    private Integer rating;

    /** 현재 재고 수량 */
    @Column(name = "stock")
    private Integer stock;

    /** 가격 */
    @Column(name = "price", precision = 12, scale = 2)
    private BigDecimal price;

    /** 현재 급여 중 여부 (기본값: false) */
    @Builder.Default
    @Column(name = "is_feeding")
    private Boolean isFeeding = false;

    /** 용품 추가 날짜 */
    @Column(name = "added_at")
    private LocalDate addedAt;

    /**
     * [목적] 용품의 모든 수정 가능한 필드를 한 번에 갱신한다.
     * [설명] Controller → Service → 엔티티 순으로 호출되며,
     *        모든 필드를 덮어쓰므로 요청 값이 null이면 null로 저장된다.
     *
     * @param name             용품 이름
     * @param category         카테고리
     * @param brand            브랜드
     * @param flavor           맛/향
     * @param productionDate   제조일
     * @param expiryDateText   유통기한 텍스트
     * @param expiryDateSpecific 유통기한 날짜
     * @param openedAt         개봉일
     * @param ingredients      성분 JSON 문자열
     * @param material         소재
     * @param size             사이즈
     * @param storageMethod    보관방법
     * @param suggestedUsage   권장 사용량
     * @param rating           평점
     * @param stock            재고 수량
     * @param price            가격
     * @param pet              연결 반려동물
     */
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

    /**
     * [목적] 급여 중(isFeeding) 상태를 반전시킨다.
     * [설명] true이면 false로, false이면 true로 변경한다.
     */
    public void toggleFeeding() {
        this.isFeeding = !Boolean.TRUE.equals(this.isFeeding);
    }

    /**
     * [목적] 재고를 delta만큼 증감한다.
     * [설명] 재고가 null이면 0으로 취급하며, 결과가 0 미만이 되면 0으로 고정한다.
     *        일정 완료 시 -1, 취소 시 +1로 호출된다.
     *
     * @param delta 재고 변화량 (양수: 증가, 음수: 감소)
     */
    public void adjustStock(int delta) {
        int current = this.stock != null ? this.stock : 0;
        this.stock = Math.max(0, current + delta);
    }
}
