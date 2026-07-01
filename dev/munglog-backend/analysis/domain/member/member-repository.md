# MemberRepository 분석

## 1. 파일 위치

```java
package com.munglog.backend.domain.member.repository;
```

```text
domain/member/repository/MemberRepository.java
```

`MemberRepository`는 `Member` 엔티티의 DB 접근을 담당하는 Repository 계층이다.

---

## 2. 전체 코드

```java
package com.munglog.backend.domain.member.repository;

import com.munglog.backend.domain.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * 회원 데이터 접근 인터페이스.
 * Member 엔티티의 DB 조회/저장/삭제를 담당하는 JPA Repository.
 * 주요 기능: 기본 CRUD (JpaRepository 상속), 카카오 ID로 회원 조회
 */
public interface MemberRepository extends JpaRepository<Member, UUID> {

    /**
     * [목적] 카카오 로그인 ID로 회원을 조회
     * [설명] OAuth2 로그인 처리 시 카카오 고유 ID로 기존 가입 여부를 확인할 때 사용한다.
     *        결과가 없으면 신규 가입 로직으로 분기된다.
     *
     * @param kakaoId 카카오에서 제공하는 사용자 고유 ID
     * @return 해당 카카오 ID의 회원 Optional (없으면 empty)
     */
    Optional<Member> findByKakaoId(Long kakaoId);
}
```

---

## 3. Repository의 역할

`Repository`는 DB에 직접 접근하는 계층이다.

`MemberRepository`는 `Member` 엔티티를 기준으로 다음 작업을 담당한다.

```text
회원 저장
회원 조회
회원 수정
회원 삭제
카카오 ID로 회원 조회
```

직접 SQL을 작성하지 않아도 된다.  
`JpaRepository`를 상속하면 Spring Data JPA가 기본 CRUD 메서드를 자동으로 제공한다.

---

## 4. JpaRepository 상속 구조

```java
public interface MemberRepository extends JpaRepository<Member, UUID>
```

이 코드는 다음 의미다.

```text
Member 엔티티를 관리하는 Repository이며,
Member의 기본키 타입은 UUID이다.
```

`JpaRepository<Entity, ID 타입>` 구조이다.

```java
JpaRepository<Member, UUID>
```

| 구분 | 의미 |
|---|---|
| `Member` | 이 Repository가 다루는 엔티티 |
| `UUID` | Member 엔티티의 PK 타입 |

즉, `MemberRepository`는 `Member` 테이블에 대해 CRUD를 수행할 수 있다.

---

## 5. JpaRepository가 제공하는 기본 메서드

`MemberRepository` 안에 직접 작성하지 않아도 다음 메서드를 사용할 수 있다.

```java
save(member);
findById(id);
findAll();
delete(member);
deleteById(id);
existsById(id);
count();
```

예시:

```java
Member savedMember = memberRepository.save(member);
```

```java
Optional<Member> member = memberRepository.findById(memberId);
```

```java
memberRepository.delete(member);
```

`MemberRepository`에는 `save`, `findById`, `delete`가 보이지 않지만,  
`JpaRepository`를 상속했기 때문에 사용할 수 있다.

---

## 6. findByKakaoId 메서드

```java
Optional<Member> findByKakaoId(Long kakaoId);
```

이 메서드는 카카오 로그인 ID로 회원을 조회한다.

Spring Data JPA는 메서드 이름을 보고 자동으로 쿼리를 만든다.

```java
findByKakaoId
```

의미는 다음과 같다.

```sql
SELECT *
FROM member
WHERE kakao_id = ?;
```

정확한 테이블명과 컬럼명은 `Member` 엔티티의 매핑에 따라 달라질 수 있다.

예를 들어 `Member` 엔티티에 다음 필드가 있어야 한다.

```java
private Long kakaoId;
```

Spring Data JPA는 `findByKakaoId`라는 이름을 보고  
`Member` 엔티티의 `kakaoId` 필드를 기준으로 조회한다.

---

## 7. Optional을 사용하는 이유

```java
Optional<Member> findByKakaoId(Long kakaoId);
```

조회 결과가 없을 수도 있기 때문에 `Optional<Member>`를 사용한다.

카카오 로그인 흐름에서는 다음처럼 사용된다.

```text
카카오 로그인 성공
→ 카카오 사용자 ID 획득
→ findByKakaoId(kakaoId)로 기존 회원 조회
→ 회원이 있으면 로그인 처리
→ 회원이 없으면 신규 회원 생성
```

예상 사용 예시:

```java
Member member = memberRepository.findByKakaoId(kakaoId)
        .orElseGet(() -> memberRepository.save(newMember));
```

또는 다음처럼 분기할 수도 있다.

```java
Optional<Member> memberOptional = memberRepository.findByKakaoId(kakaoId);

if (memberOptional.isPresent()) {
    // 기존 회원 로그인 처리
} else {
    // 신규 회원 가입 처리
}
```

---

## 8. 이 Repository가 중요한 이유

`MemberRepository`는 코드가 짧지만 인증 흐름에서 핵심 역할을 한다.

카카오 OAuth2 로그인에서는 일반적인 아이디/비밀번호 로그인이 아니라  
카카오에서 내려주는 고유 ID를 기준으로 사용자를 식별한다.

그래서 `findByKakaoId`는 다음을 판단하는 기준이 된다.

```text
이미 가입한 회원인가?
처음 로그인한 신규 회원인가?
```

즉, `MemberRepository`는 회원 가입과 로그인 분기의 출발점이다.

---

## 9. Repository에 들어가면 안 되는 것

Repository는 DB 접근만 담당해야 한다.

Repository에 넣으면 안 되는 로직은 다음과 같다.

```text
카카오 로그인 성공 처리
JWT 토큰 발급
쿠키 생성
회원 권한 검증
비즈니스 정책 판단
DTO 변환
```

이런 로직은 보통 Service, OAuth2 Handler, Security 계층에서 처리한다.

Repository는 최대한 다음 역할에 집중하는 것이 좋다.

```text
조회한다
저장한다
삭제한다
존재 여부를 확인한다
```

---

## 10. 개선 또는 확인 포인트

### 10.1 kakaoId 유니크 제약 확인

카카오 ID는 회원을 식별하는 값이므로 중복되면 안 된다.

`Member` 엔티티에서 다음과 같은 제약이 있는지 확인해야 한다.

```java
@Column(unique = true)
private Long kakaoId;
```

또는 DB에 unique constraint가 걸려 있어야 한다.

```text
kakao_id는 중복되면 안 된다.
```

중복이 가능하면 `findByKakaoId`가 논리적으로 위험해진다.

---

### 10.2 existsByKakaoId 필요 여부

현재는 `findByKakaoId`만 있다.

회원 존재 여부만 확인할 일이 많다면 다음 메서드를 추가할 수도 있다.

```java
boolean existsByKakaoId(Long kakaoId);
```

다만 지금 구조에서는 기존 회원을 바로 가져와야 하므로  
`findByKakaoId`만 있어도 충분하다.

---

### 10.3 이메일 조회 필요 여부

서비스가 확장되면 이메일 기준 조회가 필요할 수 있다.

예시:

```java
Optional<Member> findByEmail(String email);
```

하지만 카카오 로그인의 핵심 식별자가 `kakaoId`라면  
이메일보다 `kakaoId` 기준 조회가 더 안전하다.

이메일은 사용자가 카카오 계정 설정에서 변경하거나 제공하지 않을 수 있기 때문이다.

---

## 11. 한 줄 요약

`MemberRepository`는 `Member` 엔티티의 DB 접근 계층이며,  
`JpaRepository`를 통해 기본 CRUD를 제공받고,  
`findByKakaoId`를 통해 카카오 로그인 사용자의 기존 가입 여부를 확인한다.

---

## 12. 핵심 암기

```text
MemberRepository = Member 엔티티 DB 접근 담당

JpaRepository<Member, UUID> = Member의 기본 CRUD 자동 제공

findByKakaoId(Long kakaoId) = 카카오 로그인 시 기존 회원인지 확인하는 메서드
```
