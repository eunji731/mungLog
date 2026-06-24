package com.munglog.backend.common.file.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor
public class FileSyncRequest {
    private List<UUID> deletedFileIds;
}
