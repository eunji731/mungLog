package com.munglog.backend.common.file.exception;

/**
 * 파일 저장, 삭제, 읽기 중 오류가 발생했을 때 던지는 예외 클래스.
 * GlobalExceptionHandler에서 HTTP 500으로 처리된다.
 * 로컬 파일 시스템과 S3 스토리지 모두에서 사용한다.
 */
public class FileStorageException extends RuntimeException {

    /**
     * [목적] 메시지만으로 파일 저장 예외를 생성한다.
     *
     * @param message 오류 설명 메시지
     */
    public FileStorageException(String message) {
        super(message);
    }

    /**
     * [목적] 메시지와 원인 예외를 함께 포함하는 파일 저장 예외를 생성한다.
     *
     * @param message 오류 설명 메시지
     * @param cause   원인이 된 예외 (IOException 등)
     */
    public FileStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
