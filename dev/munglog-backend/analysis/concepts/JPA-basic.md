# JPA 기본 개념 정리

## JPA란?

JPA는 Java에서 객체와 DB 테이블을 연결해서 다룰 수 있게 해주는 기술이다.

정식 이름은 Java Persistence API다.

쉽게 말하면, SQL을 직접 많이 작성하지 않고 Java 객체를 DB에 저장하거나 조회할 수 있게 도와준다.

```text
Java 객체
↔
JPA
↔
DB 테이블
```

예를 들어 `Member` 객체를 저장하면 JPA가 알아서 `INSERT` SQL을 만들어 DB에 저장한다.

---

## ORM이란?

JPA는 ORM 기술의 표준이다.

ORM은 Object Relational Mapping의 약자다.

```text
Object
= Java 객체

Relational
= 관계형 DB

Mapping
= 서로 연결
```

즉, ORM은 Java 객체와 DB 테이블을 매핑해주는 기술이다.

예시:

```java
@Entity
@Table(name = "tb_member")
public class Member {
    @Id
    private Long id;

    private String nickname;
}
```

위 Java 클래스는 DB에서 이런 테이블과 연결된다.

```sql
tb_member
- id
- nickname
```

---

## JPA와 Hibernate의 관계

JPA는 규칙이고, Hibernate는 그 규칙을 실제로 구현한 라이브러리다.

```text
JPA
= 표준 인터페이스, 규칙

Hibernate
= JPA를 실제로 구현한 대표 라이브러리
```

Spring Boot에서 JPA를 사용하면 보통 내부 구현체로 Hibernate를 사용한다.

즉 실무에서 “JPA 쓴다”는 말은 보통 “Spring Data JPA + Hibernate를 쓴다”는 의미에 가깝다.

---

# Entity

## Entity란?

Entity는 DB 테이블과 연결되는 Java 클래스다.

```java
@Entity
@Table(name = "tb_member")
public class Member {
}
```

`@Entity`가 붙으면 JPA가 이 클래스를 DB와 연결되는 객체로 인식한다.

```text
Member 클래스
↔
tb_member 테이블
```

Entity 객체 하나는 DB 테이블의 row 하나라고 보면 된다.

```text
Member 객체 1개
= tb_member 테이블의 데이터 1줄
```

---

## @Entity

```java
@Entity
```

이 클래스가 JPA Entity라는 뜻이다.

JPA가 관리하는 객체가 된다.

---

## @Table

```java
@Table(name = "tb_member")
```

Entity가 연결될 DB 테이블 이름을 지정한다.

```java
@Entity
@Table(name = "tb_member")
public class Member {
}
```

이 경우 `Member` 클래스는 DB의 `tb_member` 테이블과 연결된다.

---

## @Id

```java
@Id
private Long id;
```

DB 테이블의 Primary Key를 의미한다.

즉, 각 row를 구분하는 고유값이다.

```text
id = 회원을 구분하는 고유 식별자
```

---

## @GeneratedValue

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

기본키 값을 자동 생성할 때 사용한다.

예를 들어 회원을 저장할 때 id를 직접 넣지 않아도 DB가 자동으로 번호를 만들어준다.

---

## UUID ID

프로젝트에서 UUID를 쓰는 경우도 있다.

```java
@Id
@UuidGenerator
@Column(columnDefinition = "uuid")
private UUID id;
```

UUID는 이런 형태의 고유값이다.

```text
550e8400-e29b-41d4-a716-446655440000
```

숫자 ID보다 길지만, 외부에 노출되어도 순서를 추측하기 어렵다는 장점이 있다.

---

## @Column

```java
@Column(name = "kakao_id", unique = true, nullable = false)
private Long kakaoId;
```

DB 컬럼 설정을 지정한다.

주요 옵션:

```text
name
= DB 컬럼명 지정

unique
= 중복 불가

nullable
= null 허용 여부

columnDefinition
= DB 컬럼 타입 직접 지정
```

예시:

```java
@Column(name = "ai_context", columnDefinition = "TEXT")
private String aiContext;
```

긴 문자열을 저장하기 위해 DB 컬럼 타입을 `TEXT`로 지정한 것이다.

---

# Repository

## Repository란?

Repository는 Entity를 DB에 저장하거나 조회하는 역할을 한다.

Spring Data JPA에서는 보통 이렇게 만든다.

```java
public interface MemberRepository extends JpaRepository<Member, UUID> {
}
```

이렇게만 작성해도 기본 CRUD 메서드를 사용할 수 있다.

```java
memberRepository.save(member);
memberRepository.findById(id);
memberRepository.findAll();
memberRepository.delete(member);
```

---

## JpaRepository

```java
JpaRepository<Member, UUID>
```

의미는 다음과 같다.

```text
Member
= 관리할 Entity 타입

UUID
= Member의 ID 타입
```

예를 들어 `Member`의 id가 `UUID`라면:

```java
public interface MemberRepository extends JpaRepository<Member, UUID> {
}
```

`Pet`의 id가 `Long`이라면:

```java
public interface PetRepository extends JpaRepository<Pet, Long> {
}
```

---

## 기본 제공 메서드

`JpaRepository`를 상속하면 아래 메서드를 바로 사용할 수 있다.

```java
save(entity);
findById(id);
findAll();
delete(entity);
existsById(id);
count();
```

예시:

```java
Member member = memberRepository.findById(memberId)
        .orElseThrow();

memberRepository.save(member);
```

---

## 쿼리 메서드

Spring Data JPA는 메서드 이름으로 쿼리를 만들 수 있다.

```java
Optional<Member> findByKakaoId(Long kakaoId);
```

이 메서드는 대략 이런 SQL 의미를 가진다.

```sql
SELECT *
FROM tb_member
WHERE kakao_id = ?
```

예시:

```java
Optional<Member> member = memberRepository.findByKakaoId(kakaoId);
```

자주 쓰는 형태:

```java
findByEmail(String email)
findByNickname(String nickname)
findByIsActiveTrue()
existsByKakaoId(Long kakaoId)
deleteById(UUID id)
```

---

# Service와 JPA

## Service는 Repository를 사용한다

Service는 Repository를 통해 Entity를 조회하고, Entity의 메서드를 호출해서 상태를 변경한다.

```java
@Transactional
public void withdraw(UUID memberId) {
    Member member = memberRepository.findById(memberId)
            .orElseThrow();

    member.withdraw();
}
```

여기서 역할은 다음과 같다.

```text
Service
= 회원을 찾고, 탈퇴 흐름을 실행한다.

Entity
= 탈퇴 시 자기 상태를 어떻게 바꿀지 안다.
```

---

# Transaction

## @Transactional

```java
@Transactional
```

DB 작업을 하나의 작업 단위로 묶는다.

예를 들어 회원 탈퇴 중간에 오류가 나면, 변경 내용을 되돌려야 한다.

```java
@Transactional
public void updateProfile(UUID memberId, String nickname) {
    Member member = memberRepository.findById(memberId)
            .orElseThrow();

    member.updateProfile(nickname, null);
}
```

트랜잭션 안에서 Entity를 조회하고 값을 바꾸면, JPA가 변경 내용을 감지해서 DB에 반영할 수 있다.

---

## Dirty Checking

Dirty Checking은 JPA가 Entity 변경을 자동으로 감지하는 기능이다.

예시:

```java
@Transactional
public void updateProfile(UUID memberId, String nickname) {
    Member member = memberRepository.findById(memberId)
            .orElseThrow();

    member.updateProfile(nickname, null);
}
```

여기서 `save()`를 호출하지 않아도 트랜잭션이 끝날 때 JPA가 변경을 감지한다.

```text
1. DB에서 Member 조회
2. JPA가 처음 상태를 기억
3. member.updateProfile()로 값 변경
4. 트랜잭션 종료 시점에 변경 감지
5. UPDATE SQL 자동 실행
```

대략 이런 SQL이 실행된다.

```sql
UPDATE tb_member
SET nickname = ?
WHERE id = ?
```

---

## save()는 언제 쓰나?

새 Entity를 저장할 때는 `save()`를 쓴다.

```java
Member member = Member.builder()
        .kakaoId(kakaoId)
        .kakaoEmail(email)
        .kakaoNickname(nickname)
        .build();

memberRepository.save(member);
```

이미 DB에서 조회한 Entity를 수정할 때는 트랜잭션 안에서 Dirty Checking으로 처리할 수 있다.

```java
@Transactional
public void updateNickname(UUID id, String nickname) {
    Member member = memberRepository.findById(id)
            .orElseThrow();

    member.updateProfile(nickname, null);
}
```

---

# Entity 상태

JPA Entity는 상태가 있다.

## 비영속 상태

아직 JPA가 관리하지 않는 객체다.

```java
Member member = new Member(...);
```

아직 DB와 연결되지 않았다.

---

## 영속 상태

JPA가 관리하는 상태다.

```java
Member member = memberRepository.findById(id)
        .orElseThrow();
```

또는:

```java
memberRepository.save(member);
```

이후에는 JPA가 이 객체의 변경을 추적할 수 있다.

---

## 준영속 상태

한때 JPA가 관리했지만, 지금은 관리하지 않는 상태다.

예를 들어 트랜잭션이 끝난 뒤 밖으로 나온 Entity가 여기에 해당할 수 있다.

---

# 연관관계

## DB 관계와 객체 관계

DB에서는 보통 foreign key로 관계를 맺는다.

```text
tb_pet.member_id
→
tb_member.id
```

Java Entity에서는 객체로 관계를 표현한다.

```java
@ManyToOne
private Member member;
```

---

## @ManyToOne

여러 개가 하나를 바라보는 관계다.

예를 들어 여러 반려동물은 하나의 가족 그룹에 속할 수 있다.

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "group_id")
private FamilyGroup group;
```

```text
Pet 여러 개
→
FamilyGroup 하나
```

실무에서 가장 많이 쓰는 연관관계 중 하나다.

---

## @OneToMany

하나가 여러 개를 가지는 관계다.

```java
@OneToMany(mappedBy = "group")
private List<Pet> pets = new ArrayList<>();
```

```text
FamilyGroup 하나
→
Pet 여러 개
```

`mappedBy`는 이 관계의 주인이 반대쪽에 있다는 뜻이다.

보통 외래키를 가진 쪽이 연관관계의 주인이다.

---

## @JoinColumn

```java
@JoinColumn(name = "group_id")
```

외래키 컬럼명을 지정한다.

예를 들어 `Pet` 테이블에 `group_id` 컬럼이 있으면:

```java
@ManyToOne
@JoinColumn(name = "group_id")
private FamilyGroup group;
```

이렇게 연결한다.

---

# FetchType

## FetchType.LAZY

```java
@ManyToOne(fetch = FetchType.LAZY)
private FamilyGroup group;
```

LAZY는 실제로 필요할 때 연관 객체를 가져오는 방식이다.

```text
Pet 조회
→ group은 아직 안 가져옴
→ pet.getGroup() 호출 시 group 조회
```

보통 실무에서는 LAZY를 기본으로 많이 쓴다.

---

## FetchType.EAGER

EAGER는 Entity를 조회할 때 연관 객체도 즉시 가져오는 방식이다.

```text
Pet 조회
→ group도 즉시 조회
```

편해 보이지만 불필요한 조회가 많아질 수 있다.

실무에서는 EAGER를 무분별하게 쓰면 성능 문제가 생길 수 있다.

---

# N+1 문제

JPA에서 자주 나오는 문제다.

예를 들어 펫 목록 10개를 조회했다.

```java
List<Pet> pets = petRepository.findAll();
```

그 다음 각각의 그룹 이름을 가져온다.

```java
for (Pet pet : pets) {
    System.out.println(pet.getGroup().getName());
}
```

이때 쿼리가 이렇게 나갈 수 있다.

```text
Pet 목록 조회 1번
Pet마다 group 조회 10번
총 11번 쿼리
```

이것을 N+1 문제라고 한다.

```text
1번 조회했는데
연관 데이터 때문에 N번 추가 조회 발생
```

해결 방법으로는 fetch join, EntityGraph, QueryDSL 등이 있다.

---

# @Query

## @Query란?

Repository 메서드에 직접 JPQL을 작성할 때 사용한다.

```java
@Query("SELECT m FROM Member m WHERE m.kakaoId = :kakaoId")
Optional<Member> findByKakaoId(@Param("kakaoId") Long kakaoId);
```

여기서 `Member`는 DB 테이블명이 아니라 Entity 이름이다.

JPQL은 SQL과 비슷하지만 DB 테이블이 아니라 Entity와 필드 기준으로 작성한다.

```text
SQL
= SELECT * FROM tb_member WHERE kakao_id = ?

JPQL
= SELECT m FROM Member m WHERE m.kakaoId = :kakaoId
```

---

## @Query의 단점

조건이 많아지면 문자열이 지저분해진다.

```java
@Query("SELECT s FROM SymptomSnap s WHERE s.pet.group.id = :groupId " +
       "AND (:petId IS NULL OR s.pet.id = :petId) " +
       "AND (:startDate IS NULL OR s.date >= :startDate) " +
       "AND (:endDate IS NULL OR s.date <= :endDate) " +
       "ORDER BY s.date DESC, s.time DESC")
```

이런 경우에는 QueryDSL이나 MyBatis를 고려할 수 있다.

---

# QueryDSL과 MyBatis와의 차이

## JPA 기본 Repository

단순 CRUD에 좋다.

```text
회원 저장
회원 조회
펫 등록
케어기록 수정
```

---

## @Query

고정된 조회 쿼리에 쓸 수 있다.

```text
특정 조건의 목록 조회
간단한 join 조회
```

---

## QueryDSL

조건이 동적으로 바뀌는 검색에 좋다.

```text
petId가 있으면 petId 조건 추가
startDate가 있으면 날짜 조건 추가
endDate가 있으면 날짜 조건 추가
정렬 조건 변경
```

`@Query`처럼 문자열로 억지로 작성하지 않고 Java 코드로 조건을 조립할 수 있다.

---

## MyBatis

SQL을 직접 세밀하게 작성해야 할 때 좋다.

```text
복잡한 통계
리포트
대시보드
복잡한 join
DB 튜닝이 중요한 쿼리
```

---

# Entity 설계 기준

## Entity에는 Setter를 무분별하게 열지 않는다

좋지 않은 예:

```java
@Setter
@Entity
public class Member {
    private String role;
    private Boolean isActive;
}
```

이렇게 하면 어디서든 값을 바꿀 수 있다.

```java
member.setRole("ROLE_ADMIN");
member.setIsActive(false);
```

대신 의미 있는 메서드를 둔다.

```java
public void withdraw() {
    this.isActive = false;
    this.refreshTokenHash = null;
    this.tokenIssuedAt = null;
}
```

사용:

```java
member.withdraw();
```

---

## Entity는 자기 상태 변경을 책임진다

좋은 예:

```java
public void updateProfile(String nickname, String profileImagePath) {
    if (nickname != null) {
        this.nickname = nickname;
    }

    if (profileImagePath != null) {
        this.profileImagePath = profileImagePath;
    }
}
```

이 메서드는 Member 자신의 필드만 변경하므로 Entity 안에 있어도 된다.

---

## Service는 흐름을 책임진다

```java
@Transactional
public void updateProfile(UUID memberId, UpdateProfileRequest request) {
    Member member = memberRepository.findById(memberId)
            .orElseThrow();

    member.updateProfile(request.getNickname(), request.getProfileImagePath());
}
```

Service는 다음을 담당한다.

```text
Entity 조회
권한 검증
트랜잭션 관리
외부 API 호출
다른 Entity와 협력
Entity 메서드 호출
```

---

# JPA Entity에서 Lombok 사용 기준

## 추천 조합

```java
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {
}
```

---

## Builder가 필요할 때

Entity 전체에 `@Builder`를 붙이기보다 생성자에 붙이는 방식이 더 안전하다.

```java
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {

    @Id
    private UUID id;

    private Long kakaoId;
    private String kakaoEmail;
    private String kakaoNickname;

    private Boolean isActive = true;
    private String role = "ROLE_USER";

    @Builder
    public Member(Long kakaoId, String kakaoEmail, String kakaoNickname) {
        this.kakaoId = kakaoId;
        this.kakaoEmail = kakaoEmail;
        this.kakaoNickname = kakaoNickname;
    }
}
```

---

## 피하는 것이 좋은 조합

```java
@Entity
@Data
public class Member {
}
```

```java
@Entity
@Setter
public class Member {
}
```

```java
@Entity
@AllArgsConstructor
@Builder
public class Member {
}
```

무조건 틀린 건 아니지만, Entity에서는 주의해야 한다.

---

# JPA 분석할 때 보는 순서

프로젝트에서 JPA 코드를 분석할 때는 아래 순서로 보면 좋다.

## 1. Entity 보기

확인할 것:

```text
이 Entity가 어떤 테이블과 연결되는가?
기본키는 무엇인가?
주요 필드는 무엇인가?
다른 Entity와 관계가 있는가?
상태 변경 메서드는 무엇인가?
```

---

## 2. Repository 보기

확인할 것:

```text
어떤 Entity를 관리하는가?
ID 타입은 무엇인가?
어떤 기준으로 조회하는가?
@Query가 있는가?
복잡한 조회가 있는가?
```

---

## 3. Service 보기

확인할 것:

```text
어떤 Repository를 사용하는가?
어떤 Entity를 조회하는가?
어떤 Entity 메서드를 호출하는가?
트랜잭션이 걸려 있는가?
외부 API나 토큰, 파일 처리가 섞여 있는가?
```

---

## 4. Controller 보기

확인할 것:

```text
어떤 URL로 요청을 받는가?
어떤 Service를 호출하는가?
Request DTO는 무엇인가?
Response DTO는 무엇인가?
```

---

## 5. Flow로 정리하기

예시:

```text
카카오 로그인 흐름

Controller
→ KakaoAuthService
→ MemberRepository.findByKakaoId()
→ Member 생성 또는 update()
→ Refresh Token 생성
→ member.updateRefreshToken()
→ Cookie 응답
```

---

# JPA 코드를 볼 때 자주 나오는 질문

## 왜 save() 없이 update가 되나?

트랜잭션 안에서 조회한 Entity는 JPA가 관리한다.  
값이 변경되면 트랜잭션 종료 시점에 JPA가 변경을 감지해서 UPDATE SQL을 실행한다.

이것이 Dirty Checking이다.

---

## 왜 Entity에 기본 생성자가 필요한가?

JPA가 DB에서 데이터를 읽어 Entity 객체를 만들 때 기본 생성자가 필요하다.

그래서 Entity에는 보통 아래 어노테이션을 붙인다.

```java
@NoArgsConstructor(access = AccessLevel.PROTECTED)
```

---

## 왜 Setter를 안 쓰나?

Setter를 모두 열면 아무 곳에서나 값을 바꿀 수 있다.

도메인 규칙을 지키기 어렵다.

그래서 아래처럼 의미 있는 메서드를 사용한다.

```java
member.withdraw();
member.updateProfile(...);
member.reactivate();
```

---

## 왜 Entity와 DTO를 나누나?

Entity는 DB와 연결된 핵심 객체다.  
DTO는 API 요청/응답용 객체다.

```text
Entity
= DB 저장과 도메인 규칙 담당

DTO
= Controller에서 요청/응답 데이터 전달
```

Entity를 그대로 API 응답으로 내보내면 DB 구조가 외부에 노출되고, 연관관계 때문에 문제가 생길 수 있다.

---

# 최종 정리

## JPA 핵심

```text
JPA는 Java 객체와 DB 테이블을 연결해주는 기술이다.
Entity는 DB 테이블과 연결되는 객체다.
Repository는 Entity를 저장하고 조회한다.
Service는 업무 흐름을 조율한다.
트랜잭션 안에서 Entity를 변경하면 Dirty Checking으로 UPDATE가 일어날 수 있다.
Entity에는 무분별한 setter보다 의미 있는 상태 변경 메서드를 두는 것이 좋다.
```

---

## 기억할 구조

```text
Controller
= API 요청을 받는다.

Service
= 업무 흐름을 처리한다.

Repository
= DB에서 Entity를 조회/저장한다.

Entity
= DB 테이블과 연결되고, 자기 상태 변경 규칙을 가진다.
```

---

## 지금 단계에서 우선 알아야 할 것

```text
1. @Entity는 DB 테이블과 연결되는 클래스다.
2. @Id는 기본키다.
3. @Column은 DB 컬럼 설정이다.
4. Repository는 Entity를 조회하고 저장한다.
5. @Transactional 안에서 Entity를 수정하면 변경 감지가 일어난다.
6. Entity에는 setter 대신 의미 있는 메서드를 둘 수 있다.
7. 복잡한 조회는 @Query, QueryDSL, MyBatis 중 무엇이 나은지 따져야 한다.
```