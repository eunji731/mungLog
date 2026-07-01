# Java 화살표(`->`) 정리

## 1. 결론부터

Java에서 `->`는 보통 **람다식**에서 사용된다.

```java
(parameter) -> { 실행문 }
```

예시:

```java
name -> System.out.println(name)
```

의미:

```text
name이라는 값을 받아서
System.out.println(name)을 실행한다.
```

JavaScript에서는 이런 문법을 보통 **화살표 함수**라고 부르지만, Java에서는 정확히는 **람다식에서 사용하는 화살표 연산자**라고 보는 것이 좋다.

---

## 2. Java에서 `->`가 나오는 대표 상황

Java에서 `->`는 크게 두 곳에서 자주 나온다.

```text
1. 람다식
2. switch 문 / switch expression
```

---

## 3. 람다식에서의 화살표

### 기본 형태

```java
(매개변수) -> { 실행할 코드 }
```

예시:

```java
Runnable runnable = () -> {
    System.out.println("실행됨");
};
```

뜻:

```text
매개변수 없이
System.out.println("실행됨")을 실행하는 함수처럼 동작하는 코드
```

---

## 4. 매개변수가 하나일 때

매개변수가 하나면 괄호를 생략할 수 있다.

```java
name -> System.out.println(name)
```

위 코드는 아래와 같다.

```java
(name) -> System.out.println(name)
```

예시:

```java
List<String> names = List.of("봉봉", "초코", "나비");

names.forEach(name -> System.out.println(name));
```

해석:

```text
names 안에 있는 값을 하나씩 꺼낸다.
각 값을 name이라고 부른다.
그 name을 출력한다.
```

---

## 5. 매개변수가 없을 때

매개변수가 없으면 `()`를 써야 한다.

```java
() -> System.out.println("Hello")
```

예시:

```java
Runnable task = () -> System.out.println("작업 실행");
```

---

## 6. 매개변수가 여러 개일 때

매개변수가 여러 개면 괄호가 필요하다.

```java
(a, b) -> a + b
```

예시:

```java
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;

int result = add.apply(3, 5);
System.out.println(result); // 8
```

해석:

```text
a와 b를 받아서
a + b 결과를 반환한다.
```

---

## 7. 실행문이 한 줄이면 중괄호 생략 가능

```java
name -> System.out.println(name)
```

위 코드는 아래와 같다.

```java
name -> {
    System.out.println(name);
}
```

한 줄이면 `{}`를 생략할 수 있다.

---

## 8. 값을 반환할 때

한 줄짜리 람다에서는 `return`을 생략할 수 있다.

```java
x -> x * 2
```

위 코드는 아래와 같다.

```java
x -> {
    return x * 2;
}
```

예시:

```java
Function<Integer, Integer> doubleValue = x -> x * 2;

int result = doubleValue.apply(10);
System.out.println(result); // 20
```

---

## 9. 중괄호를 쓰면 return을 직접 써야 한다

### 가능

```java
x -> x * 2
```

### 가능

```java
x -> {
    return x * 2;
}
```

### 불가능

```java
x -> {
    x * 2;
}
```

이 코드는 값을 반환하지 않기 때문에 오류가 난다.

---

## 10. switch에서의 화살표

Java 14 이후부터 switch expression에서 `->` 문법을 자주 사용한다.

```java
String result = switch (grade) {
    case "A" -> "우수";
    case "B" -> "보통";
    default -> "기타";
};
```

기존 switch보다 `break`를 덜 신경 써도 된다.

기존 방식:

```java
String result;

switch (grade) {
    case "A":
        result = "우수";
        break;
    case "B":
        result = "보통";
        break;
    default:
        result = "기타";
}
```

화살표 switch 방식:

```java
String result = switch (grade) {
    case "A" -> "우수";
    case "B" -> "보통";
    default -> "기타";
};
```

---

## 11. JavaScript 화살표 함수와 헷갈리지 않기

JavaScript에서는 이런 코드를 화살표 함수라고 부른다.

```javascript
const add = (a, b) => a + b;
```

Java에서는 `=>`가 아니라 `->`를 사용한다.

```java
(a, b) -> a + b
```

하지만 Java에서는 이걸 보통 **화살표 함수**라고 부르기보다는 **람다식**이라고 부른다.

---

## 12. 자주 보는 예시

### forEach

```java
list.forEach(item -> System.out.println(item));
```

해석:

```text
list의 item을 하나씩 꺼내서 출력한다.
```

### map

```java
List<String> names = members.stream()
        .map(member -> member.getName())
        .toList();
```

해석:

```text
members에서 member를 하나씩 꺼낸다.
각 member의 name만 뽑는다.
name 목록으로 만든다.
```

### filter

```java
List<Member> activeMembers = members.stream()
        .filter(member -> member.isActive())
        .toList();
```

해석:

```text
members에서 member를 하나씩 꺼낸다.
member.isActive()가 true인 것만 남긴다.
```

---

## 13. 한 줄 요약

```text
Java의 -> 는 람다식이나 switch expression에서 사용하는 화살표 문법이다.
람다식에서는 왼쪽이 입력값, 오른쪽이 실행할 코드 또는 반환값이다.
```

```java
member -> member.getName()
```

해석:

```text
member를 받아서 member.getName()을 반환한다.
```
