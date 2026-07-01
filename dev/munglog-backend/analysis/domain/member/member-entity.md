# Member 엔티티 분석

## 역할
- 카카오 OAuth2 로그인 회원 정보를 저장하는 JPA Entity
- 회원 프로필, 토큰, 탈퇴/재가입, AI 컨텍스트 정보를 관리한다.

## 연결 테이블
- tb_member

## 주요 필드
- id: 회원 UUID
- kakaoId: 카카오 고유 ID
- kakaoEmail: 카카오 이메일
- nickname: 앱 닉네임
- refreshTokenHash: Refresh Token 해시값
- isActive: 계정 활성화 여부
- role: 사용자 권한

## 주요 메서드
- update(): 카카오 정보 최신화
- updateProfile(): 앱 프로필 수정
- updateRefreshToken(): Refresh Token 갱신
- invalidateToken(): 로그아웃 처리
- withdraw(): 회원 탈퇴
- reactivate(): 재가입
- getDisplayName(): 표시용 닉네임 반환

## 설계 메모
- setter를 열지 않고 의미 있는 메서드로 상태를 변경한다.
- Service는 흐름을 조율하고, Entity는 자기 상태 변경 규칙을 가진다.
- withdraw() 안에 isActive=false와 토큰 제거를 묶어 탈퇴 규칙을 보존한다.

## 확인할 점
- @AllArgsConstructor와 @Builder가 Entity 전체에 붙어 있어 id, role도 외부에서 넣을 수 있다.
- Entity에서는 생성자에만 @Builder를 붙이는 방식이 더 안전할 수 있다.

### 참고 [Entity와 Service 역할 구분 메모]
- Entity는 단순히 DB 컬럼만 들고 있는 데이터 상자가 아니다.
- JPA에서는 Entity가 자기 자신의 상태 변경 규칙을 가질 수 있다. -> 자신의 필드만 변경하므로 Entity 안에 있어도 된다.

#### Service의 역할:
- Repository를 통해 Entity 조회
- 트랜잭션 관리
- 권한 검증
- 외부 API 호출
- 토큰 생성/검증
- 여러 Entity 간의 흐름 조율

#### Entity의 역할:
- 자기 자신의 상태 변경
- 자기 도메인 규칙 보존
- 무분별한 setter 사용 방지

### 즉, Service는 "누구를 찾아서 어떤 일을 시킬지" 정하고, Entity는 "그 일이 발생했을 때 내 상태를 어떻게 바꿀지" 책임진다.

- setter를 모두 열어두면 아무 곳에서나 값을 바꿀 수 있어 위험하다.
- 그래서 setIsActive(false), setRefreshTokenHash(null)처럼 직접 바꾸기보다
- withdraw() 같은 의미 있는 메서드로 상태 변경 규칙을 묶는 것이 좋다.
