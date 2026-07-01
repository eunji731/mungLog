# JPA와 Hibernate 비교 정리

## 한 줄 요약

```text
JPA는 Java에서 ORM을 사용하기 위한 표준 규칙이고,
Hibernate는 그 JPA 규칙을 실제로 구현해서 동작하게 만드는 대표 라이브러리다.
```

---

# 1. ORM이란?

JPA와 Hibernate를 이해하려면 먼저 ORM을 알아야 한다.

ORM은 **Object Relational Mapping**의 약자다.

```text
Object
= Java 객체

Relational
= 관계형 DB 테이블

Mapping
= 서로 연결
```

즉, ORM은 **Java 객체와 DB 테이블을 연결해주는 기술**이다.

예를 들어 Java에는 이런 객체가 있다.

```java
public class Member {
    private Long id;
    private String nickname;
}
```

DB에는 이런 테이블이 있다.

```sql
tb_member
- id
- nickname
```

ORM은 이 둘을 연결해준다.

```text
Member 객체
↔
tb_member 테이블
```

그래서 개발자는 SQL을 직접 많이 쓰지 않고도 객체를 저장하거나 조회할 수 있다.

```java
memberRepository.save(member);
```

위 코드를 실행하면 내부적으로는 대략 이런 SQL이 실행된다.

```sql
INSERT INTO tb_member (id, nickname)
VALUES (?, ?);
```

---

# 2. JPA란?

JPA는 **Java Persistence API**의 약자다.

쉽게 말하면, Java에서 ORM을 어떻게 사용해야 하는지 정해둔 **표준 규칙**이다.

```text
JPA
= Java ORM 표준
= 규칙
= 인터페이스
```

JPA 자체는 “이렇게 동작해야 한다”는 규칙을 제공한다.

예를 들어 JPA는 이런 어노테이션을 제공한다.

```java
@Entity
@Table(name = "tb_member")
public class Member {

    @Id
    private Long id;

    @Column(name = "nickname")
    private String nickname;
}
```

이 코드의 의미는 다음과 같다.

```text
@Entity
= 이 클래스는 DB 테이블과 연결되는 Entity다.

@Table
= 연결할 테이블 이름은 tb_member다.

@Id
= 이 필드는 기본키다.

@Column
= 이 필드는 DB 컬럼과 연결된다.
```

---

# 3. Hibernate란?

Hibernate는 JPA 표준을 실제로 구현한 대표 ORM 라이브러리다.

```text
Hibernate
= JPA 구현체
= 실제로 SQL을 만들고 DB와 통신하는 라이브러리
```

JPA가 규칙이라면, Hibernate는 그 규칙대로 실제 일을 하는 구현체다.

비유하면 다음과 같다.

```text
JPA
= 자동차 운전 규칙

Hibernate
= 실제 자동차
```

또는 이렇게 볼 수 있다.

```text
JPA
= "Entity를 저장할 수 있어야 한다"는 표준

Hibernate
= memberRepository.save(member)를 호출했을 때 실제 INSERT SQL을 만들어 실행하는 구현체
```

---

# 4. JPA와 Hibernate 관계

구조는 대략 이렇다.

```text
내 코드
↓
Spring Data JPA
↓
JPA
↓
Hibernate
↓
JDBC
↓
DB
```

조금 쉽게 보면:

```text
내가 작성한 Repository 코드
↓
JPA 규칙
↓
Hibernate가 실제 SQL 생성
↓
DB 실행
```

예를 들어 개발자가 이렇게 작성한다.

```java
memberRepository.save(member);
```

그러면 Hibernate가 내부적으로 이런 SQL을 만든다.

```sql
INSERT INTO tb_member (
    id,
    nickname
) VALUES (?, ?);
```

또 트랜잭션 안에서 Entity 값을 바꾸면:

```java
member.updateProfile("봉봉보호자", null);
```

Hibernate가 변경을 감지해서 이런 SQL을 실행할 수 있다.

```sql
UPDATE tb_member
SET nickname = ?
WHERE id = ?;
```

이것이 JPA/Hibernate의 핵심 동작 중 하나인 **Dirty Checking**이다.

---

# 5. JPA는 표준, Hibernate는 구현체

가장 중요한 차이는 이거다.

```text
JPA
= 표준

Hibernate
= 구현체
```

JPA는 직접 DB 작업을 수행하는 라이브러리라기보다, ORM을 위한 표준 API다.

Hibernate는 그 표준 API를 실제로 구현해서 DB 작업을 처리한다.

```text
JPA가 "무엇을 해야 하는지" 정의한다.
Hibernate가 "그 일을 실제로 어떻게 할지" 구현한다.
```

---

# 6. 비교표

| 구분 | JPA | Hibernate |
|---|---|---|
| 정체 | Java ORM 표준 | JPA 구현체 |
| 역할 | ORM 사용 규칙 정의 | 실제 ORM 기능 수행 |
| 직접 SQL 생성 | 직접 하지 않음 | SQL 생성 및 실행 |
| Entity 관리 | 규칙 제공 | 실제 Entity 상태 관리 |
| Dirty Checking | 개념/규칙 제공 | 실제 변경 감지 수행 |
| 어노테이션 | 표준 어노테이션 제공 | Hibernate 전용 어노테이션도 제공 |
| Spring Boot 기본 사용 | Spring Data JPA로 사용 | 내부 구현체로 주로 사용됨 |

---

# 7. JPA 표준 어노테이션

JPA에서 제공하는 대표 어노테이션은 다음과 같다.

```java
@Entity
@Table
@Id
@GeneratedValue
@Column
@ManyToOne
@OneToMany
@JoinColumn
```

예시:

```java
@Entity
@Table(name = "tb_member")
public class Member {

    @Id
    @GeneratedValue
    private Long id;

    @Column(name = "nickname")
    private String nickname;
}
```

이런 어노테이션은 JPA 표준이다.

즉, Hibernate 말고 다른 JPA 구현체를 써도 기본적으로 이해할 수 있는 어노테이션이다.

---

# 8. Hibernate 전용 어노테이션

Hibernate는 JPA 표준 외에도 자기만의 기능을 제공한다.

예를 들어 프로젝트에서 본 코드:

```java
@UuidGenerator
@Column(columnDefinition = "uuid")
private UUID id;
```

여기서 `@UuidGenerator`는 Hibernate 전용 어노테이션이다.

```java
import org.hibernate.annotations.UuidGenerator;
```

대표적인 Hibernate 전용 어노테이션 예시는 다음과 같다.

```java
@UuidGenerator
@CreationTimestamp
@UpdateTimestamp
@DynamicUpdate
```

이런 어노테이션은 Hibernate를 사용할 때는 동작하지만, 다른 JPA 구현체에서는 동작하지 않을 수 있다.

---

# 9. 실제 프로젝트에서 왜 Hibernate가 보이는가?

Spring Boot에서 JPA를 사용할 때 보통 아래 의존성을 추가한다.

```gradle
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
```

이 의존성을 사용하면 내부적으로 Hibernate가 기본 구현체로 함께 사용되는 경우가 많다.

그래서 개발자는 보통 이렇게 말한다.

```text
"JPA 쓴다"
```

하지만 실제 내부에서는 대개 이런 구조로 동작한다.

```text
Spring Data JPA
+
JPA 표준
+
Hibernate 구현체
```

즉, 실무에서 “JPA를 쓴다”는 말은 보통 다음 의미에 가깝다.

```text
Spring Data JPA를 쓰고,
JPA 어노테이션으로 Entity를 만들고,
Hibernate가 내부에서 실제 ORM 동작을 처리한다.
```

---

# 10. Spring Data JPA는 또 무엇인가?

Spring Data JPA는 JPA를 더 편하게 쓰기 위해 Spring에서 제공하는 도구다.

JPA만 직접 쓰면 EntityManager를 다뤄야 한다.

하지만 Spring Data JPA를 쓰면 Repository 인터페이스만 만들어도 기본 CRUD를 사용할 수 있다.

```java
public interface MemberRepository extends JpaRepository<Member, UUID> {
}
```

이렇게만 해도 아래 메서드를 쓸 수 있다.

```java
memberRepository.save(member);
memberRepository.findById(id);
memberRepository.findAll();
memberRepository.delete(member);
```

관계를 정리하면 다음과 같다.

```text
JPA
= ORM 표준

Hibernate
= JPA 구현체

Spring Data JPA
= JPA를 더 편하게 쓰게 해주는 Spring 프로젝트
```

전체 구조:

```text
내 코드
↓
MemberRepository
↓
Spring Data JPA
↓
JPA
↓
Hibernate
↓
JDBC
↓
DB
```

---

# 11. 예시로 이해하기

## Entity 코드

```java
@Entity
@Table(name = "tb_member")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "kakao_id", unique = true)
    private Long kakaoId;

    @Column(name = "nickname")
    private String nickname;

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }
}
```

여기서 구분하면 다음과 같다.

## JPA 표준

```java
@Entity
@Table
@Id
@Column
```

이것들은 JPA 표준 어노테이션이다.

## Hibernate 전용

```java
@UuidGenerator
```

이건 Hibernate 전용 어노테이션이다.

## Lombok

```java
@Getter
@NoArgsConstructor
```

이건 JPA/Hibernate가 아니라 Lombok이다.

---

# 12. 저장 흐름

개발자가 이렇게 작성한다.

```java
Member member = Member.builder()
        .kakaoId(12345L)
        .nickname("봉봉보호자")
        .build();

memberRepository.save(member);
```

실제 흐름은 다음과 같다.

```text
1. 개발자가 Member 객체 생성
2. memberRepository.save(member) 호출
3. Spring Data JPA가 저장 요청 처리
4. JPA 규칙에 따라 Entity 저장 진행
5. Hibernate가 INSERT SQL 생성
6. JDBC를 통해 DB에 SQL 실행
7. tb_member 테이블에 데이터 저장
```

---

# 13. 수정 흐름

```java
@Transactional
public void updateNickname(UUID memberId, String nickname) {
    Member member = memberRepository.findById(memberId)
            .orElseThrow();

    member.updateNickname(nickname);
}
```

이 코드는 `save()`를 다시 호출하지 않아도 DB에 UPDATE가 나갈 수 있다.

이유는 Hibernate가 Entity의 변경을 감지하기 때문이다.

흐름은 다음과 같다.

```text
1. 트랜잭션 시작
2. memberRepository.findById()로 Member 조회
3. Hibernate가 Member를 영속 상태로 관리
4. member.updateNickname()으로 필드 값 변경
5. 트랜잭션 종료 시점에 Hibernate가 변경 감지
6. UPDATE SQL 생성
7. DB에 반영
```

이 기능을 Dirty Checking이라고 한다.

---

# 14. Dirty Checking

Dirty Checking은 Hibernate가 Entity의 변경 사항을 자동으로 감지하는 기능이다.

예시:

```java
member.updateNickname("봉봉보호자");
```

처음 조회한 상태:

```text
nickname = "카카오닉네임"
```

변경 후 상태:

```text
nickname = "봉봉보호자"
```

Hibernate는 트랜잭션 종료 시점에 이 차이를 감지한다.

그리고 필요한 UPDATE SQL을 만든다.

```sql
UPDATE tb_member
SET nickname = ?
WHERE id = ?;
```

즉, 개발자가 SQL을 직접 작성하지 않아도 변경 사항이 DB에 반영된다.

---

# 15. EntityManager와 Hibernate

JPA의 핵심 객체 중 하나는 EntityManager다.

EntityManager는 Entity를 저장, 조회, 수정, 삭제하는 역할을 한다.

```java
entityManager.persist(member);
entityManager.find(Member.class, id);
entityManager.remove(member);
```

하지만 Spring Data JPA를 쓰면 EntityManager를 직접 만지는 경우가 줄어든다.

```java
memberRepository.save(member);
memberRepository.findById(id);
memberRepository.delete(member);
```

내부적으로는 Spring Data JPA가 JPA의 EntityManager를 사용하고, 실제 구현은 Hibernate가 처리한다.

---

# 16. JPA만 있고 Hibernate가 없으면 안 되나?

JPA는 표준 규칙이기 때문에 실제 구현체가 필요하다.

대표 구현체는 다음과 같다.

```text
Hibernate
EclipseLink
OpenJPA
```

하지만 Spring Boot에서는 Hibernate가 가장 일반적으로 많이 사용된다.

그래서 특별한 이유가 없으면 보통 Hibernate를 그대로 사용한다.

---

# 17. JPA와 Hibernate를 왜 구분해서 알아야 하나?

실무에서 오류 메시지를 보면 Hibernate가 자주 나온다.

예:

```text
org.hibernate.LazyInitializationException
org.hibernate.TransientPropertyValueException
org.hibernate.PersistentObjectException
```

개발자는 JPA를 쓰고 있다고 생각하지만, 실제 구현체가 Hibernate라서 에러 이름에 Hibernate가 나온다.

또 일부 기능은 JPA 표준이 아니라 Hibernate 전용이다.

예:

```java
@UuidGenerator
@DynamicUpdate
```

그래서 아래 구분을 알고 있어야 한다.

```text
이 기능이 JPA 표준인가?
Hibernate 전용 기능인가?
Spring Data JPA 편의 기능인가?
```

이걸 구분하면 에러를 이해하기 쉬워진다.

---

# 18. 자주 헷갈리는 관계 정리

## JPA

```text
ORM 표준 규칙
```

## Hibernate

```text
JPA를 실제로 구현한 ORM 라이브러리
```

## Spring Data JPA

```text
JPA를 Spring에서 편하게 쓰도록 도와주는 Repository 추상화
```

## JDBC

```text
Java에서 DB에 직접 SQL을 보내는 가장 기본적인 기술
```

## DB

```text
PostgreSQL, MySQL, Oracle 같은 실제 데이터 저장소
```

---

# 19. 전체 계층 구조

```text
Controller
↓
Service
↓
Repository
↓
Spring Data JPA
↓
JPA
↓
Hibernate
↓
JDBC
↓
Database
```

각 역할:

```text
Controller
= API 요청을 받는다.

Service
= 업무 흐름을 처리한다.

Repository
= Entity 저장/조회 메서드를 제공한다.

Spring Data JPA
= Repository를 편하게 쓸 수 있게 해준다.

JPA
= ORM 표준 규칙이다.

Hibernate
= JPA 규칙을 실제로 구현한다.

JDBC
= DB와 직접 통신한다.

Database
= 실제 데이터가 저장된다.
```

---

# 20. 최종 정리

## 핵심 문장

```text
JPA는 표준이고, Hibernate는 구현체다.
Spring Data JPA는 JPA를 더 편하게 쓰게 해주는 Spring 도구다.
```

---

## 비교 요약

```text
JPA
= Java ORM 표준
= Entity, Repository, 영속성 관리에 대한 규칙 제공
= 직접 SQL을 실행하는 구현체는 아님

Hibernate
= JPA 구현체
= 실제 Entity 상태 관리
= 실제 SQL 생성
= Dirty Checking 수행
= Lazy Loading 처리
= Hibernate 전용 기능 제공

Spring Data JPA
= JPA를 더 쉽게 쓰게 해주는 Spring 프로젝트
= JpaRepository 제공
= 메서드 이름 기반 쿼리 제공
```

---

## 프로젝트에서 이렇게 보면 된다

```text
@Entity, @Table, @Id, @Column
= JPA 표준 어노테이션

@UuidGenerator
= Hibernate 전용 어노테이션

JpaRepository
= Spring Data JPA 기능

memberRepository.save(member)
= Spring Data JPA를 통해 저장 요청

실제 INSERT/UPDATE SQL 생성
= Hibernate가 처리
```

---

# 21. 기억할 기준

```text
1. JPA는 규칙이다.
2. Hibernate는 그 규칙을 실제로 동작하게 하는 라이브러리다.
3. Spring Data JPA는 Repository를 편하게 쓰게 해준다.
4. 개발자는 보통 Spring Data JPA를 사용하지만, 내부에서는 Hibernate가 SQL을 만든다.
5. 에러 메시지에 Hibernate가 많이 나오는 이유는 실제 구현체가 Hibernate이기 때문이다.
6. JPA 표준 기능과 Hibernate 전용 기능을 구분할 수 있어야 한다.
```