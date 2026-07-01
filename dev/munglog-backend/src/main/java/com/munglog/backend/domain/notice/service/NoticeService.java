package com.munglog.backend.domain.notice.service;

import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import com.munglog.backend.domain.notice.domain.Notice;
import com.munglog.backend.domain.notice.dto.NoticeRequest;
import com.munglog.backend.domain.notice.dto.NoticeResponse;
import com.munglog.backend.domain.notice.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final MemberRepository memberRepository;

    @Transactional(readOnly = true)
    public List<NoticeResponse> getAll(UUID memberId) {
        Member member = findMember(memberId);
        return noticeRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(n -> NoticeResponse.from(n, member))
                .toList();
    }

    @Transactional(readOnly = true)
    public NoticeResponse getOne(UUID id, UUID memberId) {
        Member member = findMember(memberId);
        return NoticeResponse.from(findById(id), member);
    }

    @Transactional
    public void markAllRead(UUID memberId) {
        findMember(memberId).markNoticesRead();
    }

    @Transactional
    public NoticeResponse create(UUID adminId, NoticeRequest request) {
        Member admin = findMember(adminId);
        Notice notice = Notice.builder()
                .author(admin)
                .title(request.title())
                .content(request.content())
                .build();
        return NoticeResponse.from(noticeRepository.save(notice));
    }

    @Transactional
    public NoticeResponse update(UUID id, NoticeRequest request) {
        Notice notice = findById(id);
        notice.update(request.title(), request.content());
        return NoticeResponse.from(notice);
    }

    @Transactional
    public void delete(UUID id) {
        noticeRepository.delete(findById(id));
    }

    private Notice findById(UUID id) {
        return noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다."));
    }

    private Member findMember(UUID id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
    }
}
