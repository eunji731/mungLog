import axios from 'axios';

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api`
        : '/api',
    withCredentials: true, // HttpOnly 쿠키를 서버와 주고받기 위해 필수 설정
    withXSRFToken: true,
    // headers: {
    //     'Content-Type': 'application/json',
    // },
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});

// 응답 성공/실패 시 가로채기 (인터셉터)
apiClient.interceptors.response.use(
    (response) => {
        // [수정] 백엔드에서 ApiResult({ success: true, response: ... }) 껍데기로 감싸서 보낼 경우, 
        // 프론트의 모든 소스코드에서 번거롭게 .response를 또 까볼 필요 없도록 여기서 미리 한 겹 까서 바로 리턴합니다.
        if (response.data && response.data.hasOwnProperty('response')) {
            response.data = response.data.response;
        } else if (response.data && response.data.hasOwnProperty('data')) {
            response.data = response.data.data;
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // 전역 상태 초대화 로직이 들어갈 수 있음
        }
        return Promise.reject(error);
    }
);
