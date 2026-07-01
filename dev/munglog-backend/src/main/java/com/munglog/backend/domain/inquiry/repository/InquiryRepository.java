package com.munglog.backend.domain.inquiry.repository;

import com.munglog.backend.domain.inquiry.domain.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InquiryRepository extends JpaRepository<Inquiry, UUID> {
    List<Inquiry> findByMemberIdOrderByCreatedAtDesc(UUID memberId);
    List<Inquiry> findAllByOrderByCreatedAtDesc();

    long countByAdminReadAtIsNull();
}
