package com.munglog.backend.domain.category.dto;

import lombok.Getter;

@Getter
public class CategoryRequest {
    private String code;
    private String displayName;
    private String icon;
    private Integer sortOrder;
}
