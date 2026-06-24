package com.munglog.backend.domain.map.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record MapMarkerResponse(
        UUID id,
        Double lat,
        Double lng,
        String thumb,
        UUID momentId,
        String dateKey
) {}
