# Java Optional 정리

## 1. Optional이란?

`Optional<T>`는 **값이 있을 수도 있고, 없을 수도 있는 상황을 표현하는 클래스**이다.

보통 Java에서는 값이 없을 때 `null`을 사용한다.

```java
Member member = null;
```

하지만 `null`은 잘못 다루면 바로 `NullPointerException`이 발생한다.

```java
member.getName(); // member가 null이면 NullPointerException 발생
```

그래서 Java 8부터 `Optional`을 사용해서 “값이 없을 수도 있다”는 사실을 코드에 명확하게 표현할 수 있다.

```java
Optional<Member> member = Optional.empty();
```

---

## 2. Optional을 쓰는 이유

`Optional`의 핵심 목적은 다음과 같다.

```text
null을 직접 다루지 않게 하기
값이 없을 수 있음을 명확하게 표현하기
조회 결과가 없을 때의 처리를 강제하기
```

예를 들어 Repository에서 회원을 조회할 때, 항상 회원이 존재한다고 보장할 수 없다.

```java
Optional<Member> findByKakaoId(Long kakaoId);
```

이 코드는 다음 뜻이다.

```text
카카오 ID로 회원을 찾는다.
하지만 해당 회원이 없을 수도 있다.
그래서 Optional<Member>로 감싸서 반환한다.
```

---

## 3. Optional 기본 형태

```java
Optional<Member> optionalMember;
```

여기서 `Optional<Member>`는 `Member` 객체를 감싸고 있는 상자라고 보면 된다.

```text
Optional<Member>
 ├─ Member가 들어있을 수도 있음
 └─ 비어있을 수도 있음
```

즉, `Optional<Member>` 자체가 `Member`는 아니다.

잘못된 예:

```java
Optional<Member> optionalMember = memberRepository.findByKakaoId(kakaoId);
optionalMember.getName(); // 불가능
```

`Optional` 안에 있는 `Member`를 꺼내야 한다.

---

## 4. Optional 생성 방법

### 4.1 값이 있는 Optional

```java
Member member = new Member();
Optional<Member> optionalMember = Optional.of(member);
```

`Optional.of()`는 값이 반드시 있을 때 사용한다.

주의:

```java
Optional.of(null); // NullPointerException 발생
```

---

### 4.2 null일 수도 있는 값

```java
Member member = null;
Optional<Member> optionalMember = Optional.ofNullable(member);
```

`Optional.ofNullable()`은 값이 있으면 Optional에 담고, null이면 빈 Optional을 만든다.

```text
값이 있음 → Optional<Member>
값이 null → Optional.empty()
```

---

### 4.3 빈 Optional

```java
Optional<Member> optionalMember = Optional.empty();
```

값이 없다는 뜻이다.

---

## 5. Optional 값 확인하기

### 5.1 isPresent()

```java
Optional<Member> optionalMember = memberRepository.findByKakaoId(kakaoId);

if (optionalMember.isPresent()) {
    Member member = optionalMember.get();
}
```

`isPresent()`는 값이 있으면 `true`, 없으면 `false`를 반환한다.

다만 이 방식은 `null` 체크와 비슷한 스타일이라 요즘은 많이 권장되지는 않는다.

---

### 5.2 isEmpty()

```java
if (optionalMember.isEmpty()) {
    // 값이 없을 때 처리
}
```

`isEmpty()`는 값이 없으면 `true`이다.

---

## 6. Optional 값 꺼내기

### 6.1 get()

```java
Member member = optionalMember.get();
```

`get()`은 Optional 안의 값을 꺼낸다.

하지만 값이 없는데 `get()`을 호출하면 예외가 발생한다.

```java
Optional<Member> optionalMember = Optional.empty();
Member member = optionalMember.get(); // NoSuchElementException 발생
```

그래서 `get()`은 단독으로 쓰면 위험하다.

가능하면 아래 메서드들을 사용하는 것이 좋다.

---

## 7. orElse()

`orElse()`는 값이 있으면 그 값을 사용하고, 없으면 기본값을 사용한다.

```java
Member member = optionalMember.orElse(defaultMember);
```

의미:

```text
optionalMember 안에 Member가 있으면 그 Member 반환
없으면 defaultMember 반환
```

예시:

```java
Member member = memberRepository.findByKakaoId(kakaoId)
        .orElse(new Member());
```

주의할 점은 `orElse()` 안의 코드는 Optional에 값이 있어도 먼저 실행될 수 있다는 것이다.

```java
Member member = optionalMember.orElse(createNewMember());
```

`optionalMember`에 값이 있어도 `createNewMember()`가 먼저 실행될 수 있다.

그래서 새 객체 생성이나 DB 저장처럼 비용이 있거나 부작용이 있는 코드는 `orElseGet()`이 더 적합하다.

---

## 8. orElseGet()

`orElseGet()`은 값이 없을 때만 대체 로직을 실행한다.

```java
Member member = optionalMember.orElseGet(() -> createNewMember());
```

의미:

```text
값이 있으면 기존 값 사용
값이 없을 때만 createNewMember() 실행
```

Repository에서 자주 나오는 패턴이다.

```java
Member member = memberRepository.findByKakaoId(kakaoId)
        .orElseGet(() -> memberRepository.save(newMember));
```

흐름:

```text
카카오 ID로 회원 조회
→ 있으면 기존 회원 반환
→ 없으면 새 회원 저장 후 반환
```

---

## 9. orElseThrow()

`orElseThrow()`는 값이 없으면 예외를 던진다.

```java
Member member = memberRepository.findById(memberId)
        .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
```

흐름:

```text
회원 조회
→ 있으면 Member 반환
→ 없으면 예외 발생
```

Service 계층에서 많이 사용한다.

예시:

```java
public Member getMember(UUID memberId) {
    return memberRepository.findById(memberId)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
}
```

---

## 10. ifPresent()

`ifPresent()`는 값이 있을 때만 특정 로직을 실행한다.

```java
optionalMember.ifPresent(member -> {
    System.out.println(member.getName());
});
```

의미:

```text
Member가 있으면 출력한다.
Member가 없으면 아무것도 하지 않는다.
```

---

## 11. ifPresentOrElse()

`ifPresentOrElse()`는 값이 있을 때와 없을 때를 나누어 처리한다.

```java
optionalMember.ifPresentOrElse(
        member -> System.out.println(member.getName()),
        () -> System.out.println("회원이 없습니다.")
);
```

의미:

```text
값이 있으면 첫 번째 로직 실행
값이 없으면 두 번째 로직 실행
```

---

## 12. map()

`map()`은 Optional 안의 값을 다른 값으로 변환할 때 사용한다.

예를 들어 `Member`에서 `name`만 꺼내고 싶다면 다음처럼 쓸 수 있다.

```java
Optional<String> memberName = optionalMember.map(Member::getName);
```

의미:

```text
Optional<Member> → Optional<String>
```

값이 있으면 `Member::getName`을 실행하고, 값이 없으면 그대로 빈 Optional이 된다.

예시:

```java
String name = memberRepository.findByKakaoId(kakaoId)
        .map(Member::getNickname)
        .orElse("이름 없음");
```

흐름:

```text
회원이 있으면 nickname 반환
회원이 없으면 "이름 없음" 반환
```

---

## 13. filter()

`filter()`는 Optional 안의 값이 조건을 만족할 때만 유지한다.

```java
Optional<Member> activeMember = optionalMember
        .filter(member -> member.isActive());
```

의미:

```text
회원이 있고 active 상태면 유지
회원이 없거나 active가 아니면 Optional.empty()
```

---

## 14. MemberRepository에서 Optional 해석하기

현재 코드:

```java
Optional<Member> findByKakaoId(Long kakaoId);
```

이 메서드는 다음 의미다.

```text
kakaoId로 Member를 찾는다.
찾으면 Optional 안에 Member를 담아 반환한다.
못 찾으면 Optional.empty()를 반환한다.
```

예상 사용 흐름:

```java
Optional<Member> optionalMember = memberRepository.findByKakaoId(kakaoId);

if (optionalMember.isPresent()) {
    Member member = optionalMember.get();
    // 기존 회원 로그인 처리
} else {
    // 신규 회원 가입 처리
}
```

더 깔끔한 방식:

```java
Member member = memberRepository.findByKakaoId(kakaoId)
        .orElseGet(() -> memberRepository.save(newMember));
```

또는 회원이 반드시 있어야 하는 경우:

```java
Member member = memberRepository.findByKakaoId(kakaoId)
        .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
```

---

## 15. Optional 사용 시 주의점

### 15.1 Optional을 필드로 쓰는 것은 보통 피한다

권장하지 않는 예:

```java
public class Member {
    private Optional<String> email;
}
```

Entity 필드나 DTO 필드에는 보통 Optional을 쓰지 않는다.

권장:

```java
public class Member {
    private String email;
}
```

`Optional`은 주로 메서드의 반환 타입으로 사용한다.

---

### 15.2 Optional.get() 단독 사용은 피한다

위험한 예:

```java
Member member = memberRepository.findById(memberId).get();
```

회원이 없으면 바로 예외가 발생한다.

권장:

```java
Member member = memberRepository.findById(memberId)
        .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
```

---

### 15.3 null을 Optional에 넣는 습관을 피한다

나쁜 예:

```java
Optional<Member> optionalMember = null;
```

이렇게 하면 Optional을 쓰는 의미가 사라진다.

권장:

```java
Optional<Member> optionalMember = Optional.empty();
```

---

## 16. 자주 쓰는 Optional 메서드 요약

| 메서드 | 의미 |
|---|---|
| `Optional.of(value)` | null이 아닌 값을 Optional로 감싼다 |
| `Optional.ofNullable(value)` | null일 수도 있는 값을 Optional로 감싼다 |
| `Optional.empty()` | 빈 Optional 생성 |
| `isPresent()` | 값이 있으면 true |
| `isEmpty()` | 값이 없으면 true |
| `get()` | 값을 꺼낸다. 값이 없으면 예외 발생 |
| `orElse(defaultValue)` | 값이 없으면 기본값 반환 |
| `orElseGet(() -> value)` | 값이 없을 때만 로직 실행 후 반환 |
| `orElseThrow(() -> exception)` | 값이 없으면 예외 발생 |
| `ifPresent(value -> {})` | 값이 있을 때만 실행 |
| `map(value -> result)` | Optional 안의 값을 변환 |
| `filter(value -> condition)` | 조건을 만족하면 유지, 아니면 empty |

---

## 17. 실무에서 가장 자주 보는 패턴

### 17.1 조회 결과가 없으면 예외

```java
Member member = memberRepository.findById(memberId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
```

### 17.2 조회 결과가 없으면 새로 생성

```java
Member member = memberRepository.findByKakaoId(kakaoId)
        .orElseGet(() -> memberRepository.save(newMember));
```

### 17.3 값이 있으면 특정 필드만 꺼내기

```java
String nickname = memberRepository.findByKakaoId(kakaoId)
        .map(Member::getNickname)
        .orElse("사용자");
```

---

## 18. 한 줄 요약

`Optional`은 값이 없을 수도 있는 상황을 안전하게 표현하기 위한 Java 클래스이다.

Repository의 조회 메서드에서 `Optional<Member>`가 반환된다면, 그 의미는 다음과 같다.

```text
회원이 있을 수도 있고, 없을 수도 있으니
꺼내기 전에 반드시 없는 경우를 처리하라.
```
