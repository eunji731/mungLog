package com.munglog.backend.domain.inquiry.service;

import com.munglog.backend.domain.inquiry.domain.Inquiry;
import com.munglog.backend.domain.inquiry.dto.InquiryReplyRequest;
import com.munglog.backend.domain.inquiry.dto.InquiryRequest;
import com.munglog.backend.domain.inquiry.dto.InquiryResponse;
import com.munglog.backend.domain.inquiry.repository.InquiryRepository;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 1:1 문의 서비스.
 * 사용자의 문의 작성·조회·읽음 처리와 관리자의 답변 등록·읽음 처리 비즈니스 로직을 담당한다.
 * 주요 기능: 문의 작성, 내 문의 조회, 답변 읽음 처리, 관리자 전체 조회, 답변 등록, 관리자 읽음 처리
 */
@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final MemberRepository memberRepository;

    /**
     * [목적] 사용자가 새 문의를 작성한다.
     *
     * @param memberId 문의를 작성하는 사용자 UUID
     * @param request  문의 제목과 내용
     * @return 생성된 문의 응답 DTO (사용자 뷰)
     * @throws IllegalArgumentException 사용자가 존재하지 않는 경우
     */
    @Transactional
    public InquiryResponse create(UUID memberId, InquiryRequest request) {
        Member member = findMember(memberId);
        Inquiry inquiry = Inquiry.builder()
                .member(member)
                .title(request.title())
                .content(request.content())
                .build();
        return InquiryResponse.forUser(inquiryRepository.save(inquiry));
    }

    /**
     * [목적] 사용자 본인의 문의 목록을 최신순으로 조회한다.
     *
     * @param memberId 조회 요청 사용자 UUID
     * @return 해당 사용자의 문의 응답 DTO 목록 (사용자 뷰, 최신순)
     */
    @Transactional(readOnly = true)
    public List<InquiryResponse> getMyInquiries(UUID memberId) {
        return inquiryRepository.findByMemberIdOrderByCreatedAtDesc(memberId)
                .stream()
                .map(InquiryResponse::forUser)
                .toList();
    }

    /**
     * [목적] 사용자가 관리자 답변을 읽었음을 처리한다.
     * [설명] 본인의 문의인지 확인하고, 아직 답변을 읽지 않은 경우에만 읽음 시각을 기록한다.
     *
     * @param inquiryId 읽음 처리할 문의 UUID
     * @param memberId  요청 사용자 UUID
     * @return 읽음 처리 후 문의 응답 DTO (사용자 뷰)
     * @throws IllegalArgumentException 문의가 없거나 본인의 문의가 아닌 경우
     */
    @Transactional
    public InquiryResponse markReplyRead(UUID inquiryId, UUID memberId) {
        Inquiry inquiry = findById(inquiryId);
        if (!inquiry.getMember().getId().equals(memberId)) {
            throw new IllegalArgumentException("본인의 문의만 읽음 처리할 수 있습니다.");
        }
        if (inquiry.getReply() != null && inquiry.getReplyReadAt() == null) {
            inquiry.markReplyRead();
        }
        return InquiryResponse.forUser(inquiry);
    }

    /**
     * [목적] 관리자가 읽지 않은 문의 수를 조회한다.
     * [설명] 관리자 페이지 상단의 뱃지(미읽음 카운트) 표시에 사용된다.
     *
     * @return 미읽음 문의 수
     */
    @Transactional(readOnly = true)
    public long getUnreadCountForAdmin() {
        return inquiryRepository.countByAdminReadAtIsNull();
    }

    /**
     * [목적] 관리자가 전체 문의 목록을 최신순으로 조회한다.
     *
     * @return 전체 문의 응답 DTO 목록 (관리자 뷰, 최신순)
     */
    @Transactional(readOnly = true)
    public List<InquiryResponse> getAllForAdmin() {
        return inquiryRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(InquiryResponse::forAdmin)
                .toList();
    }

    /**
     * [목적] 관리자가 특정 문의에 답변을 등록한다.
     *
     * @param inquiryId 답변할 문의 UUID
     * @param adminId   답변 등록 관리자 UUID
     * @param request   답변 내용
     * @return 답변 등록 후 문의 응답 DTO (관리자 뷰)
     * @throws IllegalArgumentException 문의 또는 관리자가 존재하지 않는 경우
     */
    @Transactional
    public InquiryResponse reply(UUID inquiryId, UUID adminId, InquiryReplyRequest request) {
        Inquiry inquiry = findById(inquiryId);
        Member admin = findMember(adminId);
        inquiry.reply(request.reply(), admin);
        return InquiryResponse.forAdmin(inquiry);
    }

    /**
     * [목적] 관리자가 특정 문의를 읽었음을 처리한다.
     * [설명] adminReadAt이 null인 경우에만 현재 시각을 기록한다.
     *
     * @param inquiryId 읽음 처리할 문의 UUID
     * @return 읽음 처리 후 문의 응답 DTO (관리자 뷰)
     * @throws IllegalArgumentException 문의가 존재하지 않는 경우
     */
    @Transactional
    public InquiryResponse markAdminRead(UUID inquiryId) {
        Inquiry inquiry = findById(inquiryId);
        if (inquiry.getAdminReadAt() == null) {
            inquiry.markAdminRead();
        }
        return InquiryResponse.forAdmin(inquiry);
    }

    /**
     * [목적] ID로 문의 엔티티를 조회한다.
     *
     * @param id 조회할 문의 UUID
     * @return 문의 엔티티
     * @throws IllegalArgumentException 문의가 존재하지 않는 경우
     */
    private Inquiry findById(UUID id) {
        return inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다."));
    }

    /**
     * [목적] ID로 회원 엔티티를 조회한다.
     *
     * @param id 조회할 회원 UUID
     * @return 회원 엔티티
     * @throws IllegalArgumentException 회원이 존재하지 않는 경우
     */
    private Member findMember(UUID id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
    }
}
