package com.munglog.backend.domain.category.domain;

import jakarta.persistence.*;
import lombok.*;

/**
 * 케어기록 카테고리 엔티티.
 * 병원, 예방접종, 미용 등 케어기록을 분류하기 위한 카테고리 정보를 저장하는 클래스.
 * 주요 기능: 카테고리 수정, 비활성화 (시스템 카테고리는 비활성화 불가)
 */
@Entity
@Table(name = "tb_care_category")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CareCategory {

    /** 카테고리 고유 식별자 (자동 증가) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 카테고리 코드 (예: "HOSPITAL", "VACCINATION") — 유니크 제약 */
    @Column(name = "code", unique = true, nullable = false, length = 50)
    private String code;

    /** 화면에 표시할 카테고리 이름 (예: "병원", "예방접종") */
    @Column(name = "display_name", nullable = false, length = 50)
    private String displayName;

    /** 카테고리 아이콘 (이모지 또는 아이콘 코드) */
    @Column(name = "icon", length = 50)
    private String icon;

    /** 목록 정렬 순서 — 기본값 99 (뒤쪽에 노출) */
    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 99;

    /** 시스템 기본 제공 카테고리 여부 — true이면 삭제/비활성화 불가 */
    @Builder.Default
    @Column(name = "is_system", nullable = false)
    private Boolean isSystem = false;

    /** 카테고리 활성화 여부 — false이면 목록에서 표시되지 않음 */
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /**
     * [목적] 카테고리의 표시 정보를 수정한다.
     * [설명] displayName은 항상 변경되며, icon과 sortOrder는 null이 아닐 때만 변경된다.
     *
     * @param displayName 새로운 표시명
     * @param icon        새로운 아이콘 (null이면 기존 값 유지)
     * @param sortOrder   새로운 정렬 순서 (null이면 기존 값 유지)
     */
    public void update(String displayName, String icon, Integer sortOrder) {
        this.displayName = displayName;
        if (icon != null) this.icon = icon;
        if (sortOrder != null) this.sortOrder = sortOrder;
    }

    /**
     * [목적] 카테고리를 비활성화하여 목록에서 숨긴다.
     * [설명] 시스템 카테고리는 비활성화할 수 없다. isSystem이 true이면 예외를 발생시킨다.
     *
     * @throws IllegalStateException 시스템 카테고리를 비활성화하려 할 때 발생
     */
    public void deactivate() {
        if (Boolean.TRUE.equals(this.isSystem)) {
            throw new IllegalStateException("시스템 기본 카테고리는 비활성화할 수 없습니다.");
        }
        this.isActive = false;
    }
}
