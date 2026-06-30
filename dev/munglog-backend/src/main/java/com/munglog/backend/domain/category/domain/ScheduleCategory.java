package com.munglog.backend.domain.category.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_schedule_category")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ScheduleCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", unique = true, nullable = false, length = 50)
    private String code;

    @Column(name = "display_name", nullable = false, length = 50)
    private String displayName;

    @Column(name = "icon", length = 50)
    private String icon;

    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 99;

    @Builder.Default
    @Column(name = "is_system", nullable = false)
    private Boolean isSystem = false;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public void update(String displayName, String icon, Integer sortOrder) {
        this.displayName = displayName;
        if (icon != null) this.icon = icon;
        if (sortOrder != null) this.sortOrder = sortOrder;
    }

    public void deactivate() {
        if (Boolean.TRUE.equals(this.isSystem)) {
            throw new IllegalStateException("시스템 기본 카테고리는 비활성화할 수 없습니다.");
        }
        this.isActive = false;
    }
}
