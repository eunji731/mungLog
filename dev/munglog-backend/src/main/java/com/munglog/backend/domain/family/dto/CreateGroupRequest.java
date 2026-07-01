package com.munglog.backend.domain.family.dto;

import lombok.Getter;

/**
 * 가족 그룹 생성 요청 DTO.
 * name이 null 또는 공백이면 서비스에서 "{사용자 이름}의 가족"으로 자동 설정된다.
 */
@Getter
public class CreateGroupRequest {

    /** 생성할 그룹 이름 (null이면 기본값 사용) */
    private String name;
}
