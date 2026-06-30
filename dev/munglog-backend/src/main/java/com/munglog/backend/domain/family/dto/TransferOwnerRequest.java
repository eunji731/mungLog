package com.munglog.backend.domain.family.dto;

import lombok.Getter;

import java.util.UUID;

@Getter
public class TransferOwnerRequest {
    private UUID newOwnerUserId;
}
