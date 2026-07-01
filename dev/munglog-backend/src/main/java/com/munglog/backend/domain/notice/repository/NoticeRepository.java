package com.munglog.backend.domain.notice.repository;

import com.munglog.backend.domain.notice.domain.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * 공지사항 레포지토리.
 * 공지사항 엔티티에 대한 DB 접근을 담당한다.
 * JpaRepository를 상속하여 기본 CRUD 메서드를 제공한다.
 */
public interface NoticeRepository extends JpaRepository<Notice, UUID> {

    /**
     * [목적] 전체 공지사항을 최신 작성 순서로 조회한다.
     * [설명] createdAt 내림차순 정렬로 가장 최근 공지가 먼저 반환된다.
     *
     * @return 최신순으로 정렬된 공지사항 목록
     */
    List<Notice> findAllByOrderByCreatedAtDesc();
}
