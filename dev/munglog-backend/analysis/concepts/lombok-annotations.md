# Lombok 어노테이션 정리

## Lombok이란?

Lombok은 Java에서 반복적으로 작성해야 하는 코드를 어노테이션으로 자동 생성해주는 라이브러리다.

예를 들어 직접 작성해야 하는 getter, 생성자, builder 코드를 Lombok이 컴파일 시점에 만들어준다.

```java
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {
    private Long id;
    private String name;
}
```

위 코드는 실제로 getter, 기본 생성자, 전체 필드 생성자, builder 관련 코드가 자동 생성된다.

---

## @Getter

```java
@Getter
```

모든 필드의 getter 메서드를 자동 생성한다.

```java
@Getter
public class Member {
    private String nickname;
}
```

위 코드는 아래 getter가 자동 생성되는 것과 같다.

```java
public String getNickname() {
    return nickname;
}
```

사용 예시:

```java
member.getNickname();
```

### 사용 위치

- Entity
- DTO
- Response 객체
- 설정 객체

### 주의점

`@Getter`는 비교적 안전하다.  
Entity에서도 자주 사용한다.

---

## @Setter

```java
@Setter
```

모든 필드의 setter 메서드를 자동 생성한다.

```java
@Setter
public class Member {
    private String nickname;
}
```

아래 코드가 자동 생성되는 것과 같다.

```java
public void setNickname(String nickname) {
    this.nickname = nickname;
}
```

사용 예시:

```java
member.setNickname("봉봉보호자");
```

### Entity에서는 주의

Entity에 `@Setter`를 전체로 붙이면 아무 곳에서나 값을 변경할 수 있다.

```java
member.setRole("ROLE_ADMIN");
member.setIsActive(false);
member.setRefreshTokenHash(null);
```

이렇게 되면 도메인 규칙이 깨질 수 있다.

Entity에서는 전체 `@Setter`보다 의미 있는 메서드를 사용하는 것이 좋다.

```java
member.updateProfile("봉봉보호자", profileImagePath);
member.withdraw();
member.reactivate();
```

### 정리

```text
DTO에서는 사용 가능
Entity에서는 전체 @Setter 지양
Entity는 의미 있는 상태 변경 메서드 권장
```

---

## @NoArgsConstructor

```java
@NoArgsConstructor
```

파라미터가 없는 기본 생성자를 자동 생성한다.

```java
@NoArgsConstructor
public class Member {
    private Long id;
    private String name;
}
```

아래 코드가 자동 생성되는 것과 같다.

```java
public Member() {
}
```

### JPA Entity에서 필요한 이유

JPA는 DB에서 데이터를 조회한 뒤 Entity 객체를 만들 때 기본 생성자를 필요로 한다.

```java
@Entity
@NoArgsConstructor
public class Member {
    @Id
    private Long id;
}
```

JPA가 내부적으로 객체를 만들 수 있어야 하기 때문에 Entity에는 기본 생성자가 필요하다.

---

## @NoArgsConstructor(access = AccessLevel.PROTECTED)

```java
@NoArgsConstructor(access = AccessLevel.PROTECTED)
```

protected 기본 생성자를 자동 생성한다.

```java
protected Member() {
}
```

### 왜 protected로 두는가?

JPA는 기본 생성자가 필요하지만, 개발자가 아무 의미 없이 빈 객체를 생성하는 것은 막는 것이 좋다.

```java
new Member();
```

위와 같은 무분별한 생성을 막기 위해 protected로 제한한다.

### Entity에서 권장되는 형태

```java
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {
    @Id
    private Long id;
}
```

### 정리

```text
JPA Entity에는 기본 생성자가 필요하다.
하지만 외부에서 막 생성하지 못하게 protected로 제한하는 것이 좋다.
```

---

## @AllArgsConstructor

```java
@AllArgsConstructor
```

모든 필드를 파라미터로 받는 생성자를 자동 생성한다.

```java
@AllArgsConstructor
public class Member {
    private Long id;
    private String name;
    private String role;
}
```

아래 생성자가 자동 생성되는 것과 같다.

```java
public Member(Long id, String name, String role) {
    this.id = id;
    this.name = name;
    this.role = role;
}
```

사용 예시:

```java
Member member = new Member(1L, "봉봉보호자", "ROLE_USER");
```

### DTO에서는 편리함

```java
@Getter
@AllArgsConstructor
public class MemberResponse {
    private Long id;
    private String nickname;
}
```

응답 객체를 만들 때 편하다.

```java
return new MemberResponse(member.getId(), member.getNickname());
```

### Entity에서는 주의

Entity에 `@AllArgsConstructor`를 붙이면 모든 필드를 외부에서 넣을 수 있다.

```java
Member member = new Member(
    1L,
    "봉봉보호자",
    "ROLE_ADMIN"
);
```

`id`, `role`, `isActive`처럼 조심해야 하는 값도 외부에서 직접 넣을 수 있게 된다.

### 정리

```text
DTO에서는 사용 가능
Entity에서는 주의 필요
Entity에서는 필요한 값만 받는 생성자를 직접 만드는 방식이 더 안전함
```

---

## @RequiredArgsConstructor

```java
@RequiredArgsConstructor
```

`final` 필드 또는 `@NonNull`이 붙은 필드만 받는 생성자를 자동 생성한다.

주로 Service에서 의존성 주입을 받을 때 많이 사용한다.

```java
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final TokenProvider tokenProvider;
}
```

아래 생성자가 자동 생성되는 것과 같다.

```java
public MemberService(MemberRepository memberRepository, TokenProvider tokenProvider) {
    this.memberRepository = memberRepository;
    this.tokenProvider = tokenProvider;
}
```

### 왜 많이 쓰는가?

Spring에서 생성자 주입을 깔끔하게 사용할 수 있다.

```java
private final MemberRepository memberRepository;
```

이렇게 `final`로 선언하면 반드시 생성자를 통해 주입받아야 한다.  
`@RequiredArgsConstructor`가 그 생성자를 자동으로 만들어준다.

### 사용 위치

- Service
- Controller
- Component
- Configuration

### 정리

```text
Spring 의존성 주입에서 자주 사용
final 필드 기반 생성자 자동 생성
Service 계층에서 특히 많이 사용
```

---

## @Builder

```java
@Builder
```

객체를 생성할 때 생성자 대신 빌더 패턴을 사용할 수 있게 한다.

```java
@Getter
@Builder
public class MemberResponse {
    private Long id;
    private String nickname;
    private String profileImagePath;
}
```

사용 예시:

```java
MemberResponse response = MemberResponse.builder()
        .id(1L)
        .nickname("봉봉보호자")
        .profileImagePath("/profile/image.png")
        .build();
```

### 장점

생성자 방식은 값의 의미를 알기 어렵다.

```java
new MemberResponse(1L, "봉봉보호자", "/profile/image.png");
```

반면 builder는 필드명이 보여서 읽기 쉽다.

```java
MemberResponse.builder()
        .id(1L)
        .nickname("봉봉보호자")
        .profileImagePath("/profile/image.png")
        .build();
```

### DTO에서는 유용함

- Request DTO
- Response DTO
- 테스트 데이터
- API 요청 객체

이런 곳에서는 builder가 가독성을 높여준다.

### Entity에서는 주의

Entity 클래스 전체에 `@Builder`를 붙이면 `id`, `role`, `isActive` 같은 필드도 외부에서 넣을 수 있다.

```java
Member member = Member.builder()
        .id(UUID.randomUUID())
        .role("ROLE_ADMIN")
        .isActive(false)
        .build();
```

이런 방식은 위험할 수 있다.

### Entity에서는 생성자에 @Builder를 붙이는 방식 권장

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
        this.isActive = true;
        this.role = "ROLE_USER";
    }
}
```

이렇게 하면 필요한 값만 builder로 받을 수 있다.

```java
Member member = Member.builder()
        .kakaoId(kakaoId)
        .kakaoEmail(email)
        .kakaoNickname(nickname)
        .build();
```

### 정리

```text
DTO에서는 @Builder 사용 추천
Entity에서는 클래스 전체 @Builder 주의
Entity에서는 필요한 생성자에만 @Builder를 붙이는 방식이 더 안전함
```

---

## @Builder.Default

```java
@Builder.Default
```

`@Builder`를 사용할 때 필드의 기본값을 유지하기 위해 사용한다.

```java
@Builder
public class Member {

    @Builder.Default
    private Boolean isActive = true;
}
```

### 왜 필요한가?

아래처럼 기본값을 넣어도:

```java
private Boolean isActive = true;
```

builder로 객체를 만들면 기본값이 무시될 수 있다.

```java
Member member = Member.builder()
        .kakaoId(123L)
        .build();
```

이때 `@Builder.Default`가 없으면 `isActive`가 `null`이 될 수 있다.

그래서 기본값을 유지하려면 이렇게 쓴다.

```java
@Builder.Default
private Boolean isActive = true;
```

### 사용 예시

```java
@Builder
public class Member {

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private String role = "ROLE_USER";
}
```

### 정리

```text
@Builder를 쓰면서 기본값이 필요한 필드에 사용
isActive, role 같은 기본값 필드에 자주 사용
```

---

## @ToString

```java
@ToString
```

객체 정보를 문자열로 출력하는 `toString()` 메서드를 자동 생성한다.

```java
@ToString
public class Member {
    private Long id;
    private String nickname;
}
```

사용 예시:

```java
System.out.println(member);
```

출력 예시:

```text
Member(id=1, nickname=봉봉보호자)
```

### Entity에서는 주의

JPA Entity에서 연관관계 필드가 있는 경우 `@ToString`을 조심해야 한다.

```java
@ToString
@Entity
public class Member {

    @OneToMany(mappedBy = "member")
    private List<Pet> pets;
}
```

연관관계가 서로 물려 있으면 무한 순환이 발생할 수 있다.

```text
Member → Pet → Member → Pet → ...
```

### Entity에서는 exclude 권장

```java
@ToString(exclude = "pets")
```

또는 Entity에는 아예 `@ToString`을 붙이지 않는 것이 안전하다.

### 정리

```text
DTO에서는 사용 가능
Entity에서는 연관관계 때문에 주의
무한 순환, 지연 로딩 문제 발생 가능
```

---

## @EqualsAndHashCode

```java
@EqualsAndHashCode
```

`equals()`와 `hashCode()` 메서드를 자동 생성한다.

두 객체가 같은 객체인지 비교할 때 사용된다.

### Entity에서는 매우 주의

JPA Entity에서 `@EqualsAndHashCode`를 무분별하게 쓰면 문제가 생길 수 있다.

특히 연관관계 필드까지 포함되면 무한 순환이나 지연 로딩 문제가 생길 수 있다.

```java
@EqualsAndHashCode
@Entity
public class Member {

    @OneToMany(mappedBy = "member")
    private List<Pet> pets;
}
```

### Entity에서는 신중하게 사용

Entity에서는 보통 `id` 기준으로 직접 작성하거나, 아예 자동 생성을 피하는 경우가 많다.

### 정리

```text
DTO에서는 사용 가능
Entity에서는 매우 주의
연관관계 포함 금지
```

---

## @Data

```java
@Data
```

아래 어노테이션들을 한 번에 붙인 것과 비슷하다.

```text
@Getter
@Setter
@ToString
@EqualsAndHashCode
@RequiredArgsConstructor
```

### 편하지만 위험함

DTO에서는 간단히 사용할 수 있지만, Entity에서는 권장하지 않는다.

```java
@Data
@Entity
public class Member {
    @Id
    private Long id;
}
```

Entity에 `@Data`를 붙이면 다음 문제가 생길 수 있다.

```text
모든 setter가 열림
toString에서 연관관계 순환 가능
equals/hashCode에서 지연 로딩 문제 가능
도메인 규칙이 깨질 수 있음
```

### Entity에서는 사용하지 않는 것이 좋음

Entity에서는 보통 아래처럼 필요한 것만 붙인다.

```java
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {
}
```

### 정리

```text
DTO에서는 상황에 따라 사용 가능
Entity에서는 @Data 사용 지양
필요한 어노테이션만 명시적으로 붙이는 것이 안전함
```

---

## @AccessLevel

```java
AccessLevel.PROTECTED
```

Lombok에서 생성자나 메서드의 접근 제어자를 지정할 때 사용한다.

예시:

```java
@NoArgsConstructor(access = AccessLevel.PROTECTED)
```

생성되는 코드:

```java
protected Member() {
}
```

주요 값:

```text
AccessLevel.PUBLIC
AccessLevel.PROTECTED
AccessLevel.PACKAGE
AccessLevel.PRIVATE
```

### JPA Entity에서 자주 쓰는 형태

```java
@NoArgsConstructor(access = AccessLevel.PROTECTED)
```

JPA는 기본 생성자를 사용할 수 있고, 외부에서는 직접 생성하지 못하게 제한한다.

---

# Entity에서 Lombok 사용 추천 조합

## 기본 추천

```java
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {
}
```

가장 기본적이고 안전한 조합이다.

---

## Builder가 필요한 경우

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
        this.isActive = true;
        this.role = "ROLE_USER";
    }
}
```

---

## Entity에서 피하는 것이 좋은 조합

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

위 조합은 무조건 틀린 것은 아니지만, Entity에서는 조심해야 한다.

---

# DTO에서 Lombok 사용 추천 조합

## Response DTO

```java
@Getter
@Builder
@AllArgsConstructor
public class MemberResponse {
    private UUID id;
    private String nickname;
    private String profileImagePath;
}
```

## Request DTO

```java
@Getter
@NoArgsConstructor
public class UpdateProfileRequest {
    private String nickname;
    private String profileImagePath;
}
```

Request DTO는 JSON 역직렬화를 위해 기본 생성자가 필요할 수 있다.

---

# Service에서 Lombok 사용 추천 조합

```java
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final TokenProvider tokenProvider;
}
```

Service에서는 `@RequiredArgsConstructor`를 통한 생성자 주입을 많이 사용한다.

---

# 최종 정리

## 자주 쓰는 Lombok 어노테이션

| 어노테이션 | 역할 | Entity 사용 |
|---|---|---|
| `@Getter` | getter 자동 생성 | 사용 가능 |
| `@Setter` | setter 자동 생성 | 전체 사용 지양 |
| `@NoArgsConstructor` | 기본 생성자 생성 | 사용 가능 |
| `@NoArgsConstructor(access = PROTECTED)` | protected 기본 생성자 생성 | 권장 |
| `@AllArgsConstructor` | 전체 필드 생성자 생성 | 주의 |
| `@RequiredArgsConstructor` | final 필드 생성자 생성 | Service에서 권장 |
| `@Builder` | builder 패턴 생성 | Entity 전체 사용 주의 |
| `@Builder.Default` | builder 기본값 유지 | 필요 시 사용 |
| `@ToString` | toString 자동 생성 | 연관관계 주의 |
| `@EqualsAndHashCode` | equals/hashCode 자동 생성 | 매우 주의 |
| `@Data` | getter/setter/toString 등 묶음 | Entity 사용 지양 |

---

# 기억할 기준

```text
Entity
= @Getter + @NoArgsConstructor(access = PROTECTED) 기본
= @Setter, @Data 지양
= @Builder는 생성자에만 붙이는 방식 권장

DTO
= @Getter, @Builder, @AllArgsConstructor 사용 가능
= Request DTO는 @NoArgsConstructor 필요할 수 있음

Service
= @RequiredArgsConstructor로 final 의존성 생성자 주입
```