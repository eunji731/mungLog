package com.munglog.backend.domain.notice.dto;

/**
 * 공지사항 등록·수정 요청 DTO.
 * 제목(title)과 본문(content)을 전달하는 단순 레코드.
 *
 * @param title   공지사항 제목
 * @param content 공지사항 본문
 */
public record NoticeRequest(String title, String content) {}
