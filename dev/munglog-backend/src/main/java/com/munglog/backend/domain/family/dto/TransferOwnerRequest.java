package com.munglog.backend.domain.family.dto;

import lombok.Getter;

import java.util.UUID;

/**
 * 그룹 소유권 위임 요청 DTO.
 * 현재 OWNER가 다른 구성원에게 관리자 권한을 위임할 때 사용된다.
 */
@Getter
public class TransferOwnerRequest {

    /** 새로운 그룹 관리자(OWNER)로 지정할 구성원의 사용자 UUID */
    private UUID newOwnerUserId;
}
