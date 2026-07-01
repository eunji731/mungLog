package com.munglog.backend.domain.inquiry.repository;

import com.munglog.backend.domain.inquiry.domain.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Inquiry 엔티티에 대한 데이터 접근 인터페이스.
 * 사용자별 문의 조회, 전체 목록 조회, 미읽음 카운트 기능을 제공한다.
 */
public interface InquiryRepository extends JpaRepository<Inquiry, UUID> {

    /**
     * [목적] 특정 사용자의 문의 목록을 최신순으로 조회한다.
     *
     * @param memberId 조회할 사용자 UUID
     * @return 해당 사용자의 문의 목록 (최신순)
     */
    List<Inquiry> findByMemberIdOrderByCreatedAtDesc(UUID memberId);

    /**
     * [목적] 전체 문의 목록을 최신순으로 조회한다. (관리자 전용)
     *
     * @return 전체 문의 목록 (최신순)
     */
    List<Inquiry> findAllByOrderByCreatedAtDesc();

    /**
     * [목적] 관리자가 아직 읽지 않은 문의 수를 반환한다.
     * [설명] adminReadAt이 null인 문의가 미읽음으로 간주된다.
     *        관리자 페이지 배지(뱃지) 카운트에 사용된다.
     *
     * @return 미읽음 문의 수
     */
    long countByAdminReadAtIsNull();
}
