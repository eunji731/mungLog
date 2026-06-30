package com.munglog.backend.domain.category.dto;

import com.munglog.backend.domain.category.domain.CareCategory;
import com.munglog.backend.domain.category.domain.ScheduleCategory;

public record CategoryResponse(
        Long id,
        String code,
        String displayName,
        String icon,
        Integer sortOrder,
        Boolean isSystem
) {
    public static CategoryResponse from(CareCategory c) {
        return new CategoryResponse(c.getId(), c.getCode(), c.getDisplayName(), c.getIcon(), c.getSortOrder(), c.getIsSystem());
    }

    public static CategoryResponse from(ScheduleCategory c) {
        return new CategoryResponse(c.getId(), c.getCode(), c.getDisplayName(), c.getIcon(), c.getSortOrder(), c.getIsSystem());
    }
}
