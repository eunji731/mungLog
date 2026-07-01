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

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final MemberRepository memberRepository;

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

    @Transactional(readOnly = true)
    public List<InquiryResponse> getMyInquiries(UUID memberId) {
        return inquiryRepository.findByMemberIdOrderByCreatedAtDesc(memberId)
                .stream()
                .map(InquiryResponse::forUser)
                .toList();
    }

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

    @Transactional(readOnly = true)
    public List<InquiryResponse> getAllForAdmin() {
        return inquiryRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(InquiryResponse::forAdmin)
                .toList();
    }

    @Transactional
    public InquiryResponse reply(UUID inquiryId, UUID adminId, InquiryReplyRequest request) {
        Inquiry inquiry = findById(inquiryId);
        Member admin = findMember(adminId);
        inquiry.reply(request.reply(), admin);
        return InquiryResponse.forAdmin(inquiry);
    }

    @Transactional
    public InquiryResponse markAdminRead(UUID inquiryId) {
        Inquiry inquiry = findById(inquiryId);
        if (inquiry.getAdminReadAt() == null) {
            inquiry.markAdminRead();
        }
        return InquiryResponse.forAdmin(inquiry);
    }

    private Inquiry findById(UUID id) {
        return inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다."));
    }

    private Member findMember(UUID id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
    }
}
