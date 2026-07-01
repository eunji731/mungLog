package com.munglog.backend.domain.inquiry.dto;

/**
 * 관리자 답변 등록 요청 DTO.
 * 관리자가 특정 문의에 답변 텍스트를 전달할 때 사용된다.
 *
 * @param reply 답변 내용
 */
public record InquiryReplyRequest(String reply) {}
