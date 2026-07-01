# Java 람다식(Lambda Expression) 정리

## 1. 람다식이란?

람다식은 **메서드를 간단한 식처럼 표현하는 문법**이다.

쉽게 말하면 다음과 같다.

```text
익명 클래스를 짧게 줄여 쓰는 문법
함수처럼 코드를 변수나 메서드 인자로 넘길 수 있게 해주는 문법
```

예시:

```java
name -> System.out.println(name)
```

의미:

```text
name을 받아서 출력하는 동작
```

---

## 2. 람다식 기본 형태

```java
(매개변수) -> { 실행문 }
```

예시:

```java
(x) -> {
    return x * 2;
}
```

한 줄이면 더 줄일 수 있다.

```java
x -> x * 2
```

---

## 3. 람다식이 필요한 이유

예전 Java에서는 특정 동작을 넘기려면 익명 클래스를 많이 사용했다.

### 람다식 없이 작성한 코드

```java
Runnable runnable = new Runnable() {
    @Override
    public void run() {
        System.out.println("실행됨");
    }
};
```

### 람다식으로 줄인 코드

```java
Runnable runnable = () -> System.out.println("실행됨");
```

둘은 비슷한 역할을 한다.

람다식을 사용하면 코드가 훨씬 짧아진다.

---

## 4. 람다식은 아무 곳에서나 못 쓴다

람다식은 **함수형 인터페이스** 자리에만 사용할 수 있다.

함수형 인터페이스란 **추상 메서드가 하나만 있는 인터페이스**다.

예시:

```java
@FunctionalInterface
public interface Calculator {
    int calculate(int a, int b);
}
```

추상 메서드가 하나다.

```java
int calculate(int a, int b);
```

그래서 람다식으로 구현할 수 있다.

```java
Calculator add = (a, b) -> a + b;

int result = add.calculate(3, 5);
System.out.println(result); // 8
```

---

## 5. 함수형 인터페이스란?

함수형 인터페이스는 람다식의 타입 역할을 한다.

람다식만 단독으로는 타입을 알 수 없다.

```java
(a, b) -> a + b
```

이 코드만 보면 Java는 다음을 알기 어렵다.

```text
매개변수 타입이 int인지 Long인지 String인지
반환 타입이 int인지 String인지
어떤 메서드를 구현하는 것인지
```

그래서 람다식은 항상 함수형 인터페이스 타입과 함께 사용된다.

```java
Calculator add = (a, b) -> a + b;
```

여기서 `Calculator`가 람다식의 타입이다.

---

## 6. 자주 쓰는 기본 함수형 인터페이스

Java는 자주 쓰는 함수형 인터페이스를 이미 제공한다.

패키지:

```java
java.util.function
```

| 인터페이스 | 형태 | 의미 |
|---|---|---|
| `Function<T, R>` | T → R | 값을 받아서 다른 값으로 변환 |
| `Consumer<T>` | T → void | 값을 받아서 소비만 함 |
| `Supplier<T>` | 없음 → T | 값을 공급함 |
| `Predicate<T>` | T → boolean | 조건 판단 |
| `BiFunction<T, U, R>` | T, U → R | 값 두 개를 받아 결과 반환 |

---

## 7. Function 예시

`Function<T, R>`은 값을 받아서 다른 값으로 바꿀 때 사용한다.

```java
Function<Integer, Integer> doubleValue = x -> x * 2;

int result = doubleValue.apply(10);
System.out.println(result); // 20
```

해석:

```text
Integer를 받아서 Integer를 반환한다.
x를 받아서 x * 2를 반환한다.
```

---

## 8. Consumer 예시

`Consumer<T>`는 값을 받아서 사용만 하고 반환하지 않는다.

```java
Consumer<String> printer = name -> System.out.println(name);

printer.accept("봉봉");
```

해석:

```text
String을 받아서 출력한다.
반환값은 없다.
```

`forEach`에서 자주 사용된다.

```java
List<String> names = List.of("봉봉", "초코", "나비");

names.forEach(name -> System.out.println(name));
```

---

## 9. Supplier 예시

`Supplier<T>`는 매개변수 없이 값을 반환한다.

```java
Supplier<String> supplier = () -> "기본 이름";

String name = supplier.get();
System.out.println(name);
```

해석:

```text
입력값은 없다.
호출하면 String 값을 준다.
```

---

## 10. Predicate 예시

`Predicate<T>`는 값을 받아서 true 또는 false를 반환한다.

```java
Predicate<Integer> isAdult = age -> age >= 20;

System.out.println(isAdult.test(25)); // true
System.out.println(isAdult.test(17)); // false
```

해석:

```text
age를 받아서 20 이상인지 검사한다.
```

`filter`에서 자주 사용된다.

```java
List<Member> activeMembers = members.stream()
        .filter(member -> member.isActive())
        .toList();
```

---

## 11. BiFunction 예시

`BiFunction<T, U, R>`은 값을 두 개 받아서 하나의 결과를 반환한다.

```java
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;

int result = add.apply(3, 5);
System.out.println(result); // 8
```

해석:

```text
Integer 두 개를 받아서 Integer 하나를 반환한다.
```

---

## 12. 람다식 문법 정리

### 매개변수 없음

```java
() -> System.out.println("Hello")
```

### 매개변수 하나

```java
name -> System.out.println(name)
```

### 매개변수 여러 개

```java
(a, b) -> a + b
```

### 실행문 여러 줄

```java
(a, b) -> {
    int result = a + b;
    return result;
}
```

### 반환값 한 줄

```java
x -> x * 2
```

### 반환값 여러 줄

```java
x -> {
    int result = x * 2;
    return result;
}
```

---

## 13. 람다식과 메서드 참조

람다식이 단순히 기존 메서드를 호출하는 형태라면 메서드 참조로 줄일 수 있다.

### 람다식

```java
names.forEach(name -> System.out.println(name));
```

### 메서드 참조

```java
names.forEach(System.out::println);
```

둘은 비슷한 의미다.

```text
names의 값을 하나씩 출력한다.
```

처음에는 메서드 참조보다 람다식을 먼저 익히는 것이 좋다.

---

## 14. Optional과 람다식

`Optional`에서도 람다식이 자주 나온다.

```java
Member member = memberRepository.findByKakaoId(kakaoId)
        .orElseGet(() -> memberRepository.save(newMember));
```

해석:

```text
kakaoId로 회원을 찾는다.
있으면 그 회원을 사용한다.
없으면 () -> memberRepository.save(newMember)를 실행해서 새 회원을 저장한다.
```

여기서 `orElseGet` 안의 람다식은 값이 없을 때만 실행된다.

---

## 15. Stream과 람다식

람다식은 Stream API에서 정말 많이 사용된다.

```java
List<String> names = members.stream()
        .filter(member -> member.isActive())
        .map(member -> member.getName())
        .toList();
```

해석:

```text
members를 stream으로 만든다.
활성 회원만 남긴다.
각 회원에서 이름만 꺼낸다.
이름 목록으로 만든다.
```

단계별 해석:

```java
.filter(member -> member.isActive())
```

```text
member를 받아서 active 상태인지 검사한다.
true인 것만 통과한다.
```

```java
.map(member -> member.getName())
```

```text
member를 받아서 member.getName() 결과로 바꾼다.
```

---

## 16. 람다식에서 헷갈리기 쉬운 점

### 16.1 람다식은 메서드 이름이 없다

일반 메서드:

```java
public int doubleValue(int x) {
    return x * 2;
}
```

람다식:

```java
x -> x * 2
```

람다식은 이름 없이 동작만 표현한다.

---

### 16.2 람다식은 타입이 필요하다

이것만 단독으로는 사용하기 어렵다.

```java
x -> x * 2
```

아래처럼 타입이 있어야 한다.

```java
Function<Integer, Integer> doubleValue = x -> x * 2;
```

---

### 16.3 중괄호가 있으면 return을 명시해야 한다

가능:

```java
x -> x * 2
```

가능:

```java
x -> {
    return x * 2;
}
```

불가능:

```java
x -> {
    x * 2;
}
```

---

## 17. 한 줄 요약

```text
람다식은 함수형 인터페이스의 추상 메서드를 짧게 구현하는 문법이다.
```

실무에서 자주 보이는 형태는 다음과 같다.

```java
member -> member.getName()
```

해석:

```text
member를 받아서 member.getName()을 반환한다.
```

```java
() -> memberRepository.save(newMember)
```

해석:

```text
입력값 없이 memberRepository.save(newMember)를 실행한다.
```
