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

/**
 * 공지사항 서비스.
 * 공지사항 조회·등록·수정·삭제 및 읽음 처리 비즈니스 로직을 담당하는 서비스 클래스.
 * 주요 기능: 전체 목록 조회(읽음 여부 포함), 단건 조회, 등록, 수정, 삭제, 전체 읽음 처리
 */
@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final MemberRepository memberRepository;

    /**
     * [목적] 전체 공지사항 목록을 최신순으로 조회하고 읽음 여부를 포함한다.
     * [설명] 회원의 lastNoticeReadAt과 각 공지의 createdAt을 비교하여 새 글 여부(isNew)를 판단한다.
     *
     * @param memberId 조회 요청을 한 회원 UUID
     * @return 읽음 여부가 포함된 공지사항 목록
     * @throws IllegalArgumentException 회원이 존재하지 않을 경우
     */
    @Transactional(readOnly = true)
    public List<NoticeResponse> getAll(UUID memberId) {
        Member member = findMember(memberId);
        return noticeRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(n -> NoticeResponse.from(n, member))
                .toList();
    }

    /**
     * [목적] 특정 공지사항 단건을 조회한다.
     * [설명] 공지 ID와 회원 ID로 각각 조회 후, 읽음 여부를 포함한 응답 DTO를 반환한다.
     *
     * @param id       조회할 공지사항 UUID
     * @param memberId 조회 요청 회원 UUID
     * @return 읽음 여부가 포함된 공지사항 응답 DTO
     * @throws IllegalArgumentException 공지사항 또는 회원이 존재하지 않을 경우
     */
    @Transactional(readOnly = true)
    public NoticeResponse getOne(UUID id, UUID memberId) {
        Member member = findMember(memberId);
        return NoticeResponse.from(findById(id), member);
    }

    /**
     * [목적] 사용자의 공지사항 전체 읽음 상태를 현재 시각으로 갱신한다.
     * [설명] Member의 markNoticesRead()를 호출하여 lastNoticeReadAt 필드를 업데이트한다.
     *        이후 조회 시 isNew=false로 표시된다.
     *
     * @param memberId 읽음 처리를 요청한 회원 UUID
     * @throws IllegalArgumentException 회원이 존재하지 않을 경우
     */
    @Transactional
    public void markAllRead(UUID memberId) {
        findMember(memberId).markNoticesRead();
    }

    /**
     * [목적] 새 공지사항을 등록한다.
     * [설명] 관리자 회원 정보와 요청 DTO로 Notice 엔티티를 생성하고 저장한다.
     *
     * @param adminId 공지사항을 작성하는 관리자 회원 UUID
     * @param request 제목·내용이 담긴 요청 DTO
     * @return 저장된 공지사항 응답 DTO
     * @throws IllegalArgumentException 관리자 회원이 존재하지 않을 경우
     */
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

    /**
     * [목적] 기존 공지사항의 제목·내용을 수정한다.
     * [설명] ID로 공지사항을 조회한 뒤 update() 메서드를 호출하여 변경 감지(dirty checking)로 저장한다.
     *
     * @param id      수정할 공지사항 UUID
     * @param request 새 제목·내용이 담긴 요청 DTO
     * @return 수정된 공지사항 응답 DTO
     * @throws IllegalArgumentException 공지사항이 존재하지 않을 경우
     */
    @Transactional
    public NoticeResponse update(UUID id, NoticeRequest request) {
        Notice notice = findById(id);
        notice.update(request.title(), request.content());
        return NoticeResponse.from(notice);
    }

    /**
     * [목적] 공지사항을 DB에서 완전히 삭제한다.
     * [설명] ID로 조회된 공지사항 엔티티를 delete()로 제거한다.
     *
     * @param id 삭제할 공지사항 UUID
     * @throws IllegalArgumentException 공지사항이 존재하지 않을 경우
     */
    @Transactional
    public void delete(UUID id) {
        noticeRepository.delete(findById(id));
    }

    /**
     * [목적] 공지사항 ID로 엔티티를 조회한다.
     *
     * @param id 조회할 공지사항 UUID
     * @return 공지사항 엔티티
     * @throws IllegalArgumentException 존재하지 않을 경우
     */
    private Notice findById(UUID id) {
        return noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다."));
    }

    /**
     * [목적] 회원 ID로 회원 엔티티를 조회한다.
     *
     * @param id 조회할 회원 UUID
     * @return 회원 엔티티
     * @throws IllegalArgumentException 존재하지 않을 경우
     */
    private Member findMember(UUID id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
    }
}
