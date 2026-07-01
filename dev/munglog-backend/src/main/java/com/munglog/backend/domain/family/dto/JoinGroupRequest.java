package com.munglog.backend.domain.family.dto;

import lombok.Getter;

/**
 * 가족 그룹 참여 요청 DTO.
 * 기존 그룹의 OWNER로부터 받은 초대 코드를 전달한다.
 */
@Getter
public class JoinGroupRequest {

    /** 참여할 그룹의 초대 코드 (대소문자 무관, 서비스에서 대문자로 정규화) */
    private String inviteCode;
}
