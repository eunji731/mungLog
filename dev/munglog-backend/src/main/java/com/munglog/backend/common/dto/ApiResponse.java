package com.munglog.backend.common.dto;

import lombok.Getter;

/**
 * 모든 API의 공통 응답 래퍼 클래스.
 * 성공/실패 여부, 데이터, 에러 정보를 일관된 형식으로 반환한다.
 *
 * @param <T> 응답 데이터 타입
 */
@Getter
public class ApiResponse<T> {

    /** 요청 처리 성공 여부 */
    private final boolean success;

    /** 성공 시 반환할 데이터 (실패 시 null) */
    private final T data;

    /** 실패 시 반환할 에러 정보 (성공 시 null) */
    private final ApiError error;

    private ApiResponse(boolean success, T data, ApiError error) {
        this.success = success;
        this.data = data;
        this.error = error;
    }

    /**
     * [목적] 데이터를 포함한 성공 응답을 생성한다.
     *
     * @param data 응답에 포함할 데이터
     * @return 성공 응답 객체
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    /**
     * [목적] 데이터 없이 성공 응답을 생성한다. (예: 삭제 성공)
     *
     * @return 데이터가 null인 성공 응답 객체
     */
    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>(true, null, null);
    }

    /**
     * [목적] 실패 응답을 생성한다.
     *
     * @param message 사용자에게 보여줄 에러 메시지
     * @param code    클라이언트가 에러 종류를 구분할 수 있는 코드 문자열
     * @return 실패 응답 객체
     */
    public static <T> ApiResponse<T> error(String message, String code) {
        return new ApiResponse<>(false, null, new ApiError(message, code));
    }

    /**
     * API 에러 정보를 담는 내부 클래스.
     */
    @Getter
    public static class ApiError {
        /** 사용자에게 표시할 에러 메시지 */
        private final String message;

        /** 에러 종류를 나타내는 코드 (예: BAD_REQUEST, FORBIDDEN) */
        private final String code;

        public ApiError(String message, String code) {
            this.message = message;
            this.code = code;
        }
    }
}
