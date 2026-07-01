package com.munglog.backend.domain.notice.repository;

import com.munglog.backend.domain.notice.domain.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NoticeRepository extends JpaRepository<Notice, UUID> {
    List<Notice> findAllByOrderByCreatedAtDesc();
}
