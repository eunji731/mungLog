package com.munglog.backend.domain.inquiry.dto;

/**
 * 1:1 문의 작성 요청 DTO.
 * 사용자가 새 문의를 등록할 때 제목과 본문을 전달한다.
 *
 * @param title   문의 제목
 * @param content 문의 본문 내용
 */
public record InquiryRequest(String title, String content) {}
