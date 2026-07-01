package com.munglog.backend.domain.family.dto;

import lombok.Getter;

/**
 * 그룹 이름 변경 요청 DTO.
 * OWNER 권한을 가진 구성원만 호출할 수 있으며, 빈 값은 서비스에서 예외 처리된다.
 */
@Getter
public class UpdateGroupNameRequest {

    /** 변경할 새 그룹 이름 */
    private String name;
}
