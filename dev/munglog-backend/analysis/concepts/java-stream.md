# Java Stream 정리

## 1. Stream이란?

Java Stream은 컬렉션이나 배열 같은 데이터 묶음을 **흐름처럼 처리하는 기능**이다.

쉽게 말하면 다음과 같다.

```text
List, Set, 배열 같은 데이터들
→ stream()으로 흐름을 만든다
→ filter, map, sorted 같은 중간 작업을 한다
→ collect, count, forEach 같은 최종 작업으로 결과를 만든다
```

예시:

```java
List<String> names = List.of("bonbon", "choco", "momo");

List<String> result = names.stream()
        .filter(name -> name.startsWith("b"))
        .toList();
```

결과:

```text
[bonbon]
```

---

## 2. Stream을 왜 쓰는가?

기존 for문으로도 데이터를 처리할 수 있다.

```java
List<String> names = List.of("bonbon", "choco", "momo");
List<String> result = new ArrayList<>();

for (String name : names) {
    if (name.startsWith("b")) {
        result.add(name);
    }
}
```

Stream으로 쓰면 다음처럼 표현할 수 있다.

```java
List<String> result = names.stream()
        .filter(name -> name.startsWith("b"))
        .toList();
```

Stream은 데이터를 직접 하나씩 꺼내서 처리하는 느낌보다, **무엇을 하고 싶은지 선언적으로 표현**하는 방식이다.

```text
for문: 어떻게 반복할지 직접 작성
Stream: 어떤 조건으로 걸러낼지, 어떻게 바꿀지 작성
```

---

## 3. Stream의 기본 구조

Stream은 보통 3단계로 구성된다.

```text
1. Stream 생성
2. 중간 연산
3. 최종 연산
```

예시:

```java
List<String> result = names.stream()              // 1. Stream 생성
        .filter(name -> name.startsWith("b"))    // 2. 중간 연산
        .map(String::toUpperCase)                // 2. 중간 연산
        .toList();                               // 3. 최종 연산
```

---

## 4. Stream 생성

### 4.1 List에서 Stream 만들기

```java
List<String> names = List.of("bonbon", "choco", "momo");

names.stream();
```

### 4.2 Set에서 Stream 만들기

```java
Set<String> names = Set.of("bonbon", "choco", "momo");

names.stream();
```

### 4.3 배열에서 Stream 만들기

```java
String[] names = {"bonbon", "choco", "momo"};

Arrays.stream(names);
```

---

## 5. 중간 연산

중간 연산은 Stream 데이터를 가공하는 단계다.

중간 연산은 바로 실행되지 않고, 최종 연산이 호출될 때 실행된다.

대표적인 중간 연산은 다음과 같다.

```text
filter  → 조건에 맞는 데이터만 남김
map     → 데이터를 다른 형태로 변환
sorted  → 정렬
distinct → 중복 제거
limit   → 앞에서 N개만 가져옴
skip    → 앞에서 N개를 건너뜀
```

---

## 6. filter

`filter`는 조건에 맞는 데이터만 남긴다.

```java
List<String> names = List.of("bonbon", "choco", "momo");

List<String> result = names.stream()
        .filter(name -> name.startsWith("b"))
        .toList();
```

결과:

```text
[bonbon]
```

`filter` 안에는 true 또는 false를 반환하는 조건식이 들어간다.

```java
name -> name.startsWith("b")
```

의미:

```text
name이 "b"로 시작하면 true
아니면 false
true인 데이터만 남긴다
```

---

## 7. map

`map`은 데이터를 다른 값으로 변환한다.

```java
List<String> names = List.of("bonbon", "choco", "momo");

List<String> result = names.stream()
        .map(name -> name.toUpperCase())
        .toList();
```

결과:

```text
[BONBON, CHOCO, MOMO]
```

`map`은 엔티티를 DTO로 바꿀 때도 자주 사용한다.

```java
List<MemberResponse> responses = members.stream()
        .map(member -> new MemberResponse(member.getId(), member.getNickname()))
        .toList();
```

의미:

```text
Member 목록
→ MemberResponse 목록으로 변환
```

---

## 8. sorted

`sorted`는 데이터를 정렬한다.

### 8.1 기본 정렬

```java
List<Integer> numbers = List.of(3, 1, 2);

List<Integer> result = numbers.stream()
        .sorted()
        .toList();
```

결과:

```text
[1, 2, 3]
```

### 8.2 내림차순 정렬

```java
List<Integer> result = numbers.stream()
        .sorted(Comparator.reverseOrder())
        .toList();
```

결과:

```text
[3, 2, 1]
```

### 8.3 객체 정렬

```java
List<Member> result = members.stream()
        .sorted(Comparator.comparing(Member::getCreatedAt))
        .toList();
```

의미:

```text
Member를 createdAt 기준으로 오름차순 정렬
```

내림차순:

```java
List<Member> result = members.stream()
        .sorted(Comparator.comparing(Member::getCreatedAt).reversed())
        .toList();
```

---

## 9. distinct

`distinct`는 중복을 제거한다.

```java
List<String> names = List.of("bonbon", "bonbon", "choco");

List<String> result = names.stream()
        .distinct()
        .toList();
```

결과:

```text
[bonbon, choco]
```

객체에서 `distinct`를 제대로 쓰려면 `equals()`와 `hashCode()` 기준이 중요하다.

---

## 10. limit

`limit`은 앞에서부터 원하는 개수만 가져온다.

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);

List<Integer> result = numbers.stream()
        .limit(3)
        .toList();
```

결과:

```text
[1, 2, 3]
```

---

## 11. skip

`skip`은 앞에서부터 원하는 개수를 건너뛴다.

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);

List<Integer> result = numbers.stream()
        .skip(2)
        .toList();
```

결과:

```text
[3, 4, 5]
```

---

## 12. 최종 연산

최종 연산은 Stream 처리를 끝내고 결과를 만든다.

대표적인 최종 연산은 다음과 같다.

```text
toList   → List로 변환
collect  → 원하는 컬렉션이나 형태로 수집
forEach  → 하나씩 실행
count    → 개수 반환
anyMatch → 하나라도 조건에 맞는지 확인
allMatch → 전부 조건에 맞는지 확인
noneMatch → 전부 조건에 맞지 않는지 확인
findFirst → 첫 번째 값 찾기
findAny   → 아무 값 하나 찾기
```

---

## 13. toList

`toList`는 Stream 결과를 List로 만든다.

```java
List<String> result = names.stream()
        .filter(name -> name.length() >= 5)
        .toList();
```

Java 16 이상에서는 `.toList()`를 사용할 수 있다.

Java 8~15에서는 보통 다음처럼 쓴다.

```java
List<String> result = names.stream()
        .filter(name -> name.length() >= 5)
        .collect(Collectors.toList());
```

---

## 14. collect

`collect`는 Stream 결과를 원하는 형태로 모을 때 사용한다.

```java
List<String> result = names.stream()
        .filter(name -> name.length() >= 5)
        .collect(Collectors.toList());
```

Set으로 모으기:

```java
Set<String> result = names.stream()
        .collect(Collectors.toSet());
```

문자열 합치기:

```java
String result = names.stream()
        .collect(Collectors.joining(", "));
```

결과:

```text
bonbon, choco, momo
```

---

## 15. forEach

`forEach`는 각 요소마다 작업을 실행한다.

```java
names.stream()
        .forEach(name -> System.out.println(name));
```

결과:

```text
bonbon
choco
momo
```

주의할 점:

`forEach`는 결과를 만드는 용도보다, 출력이나 단순 실행 용도에 가깝다.

```java
names.stream()
        .filter(name -> name.startsWith("b"))
        .forEach(name -> System.out.println(name));
```

---

## 16. count

`count`는 요소 개수를 반환한다.

```java
long count = names.stream()
        .filter(name -> name.length() >= 5)
        .count();
```

결과:

```text
3
```

반환 타입은 `long`이다.

---

## 17. anyMatch, allMatch, noneMatch

### 17.1 anyMatch

하나라도 조건에 맞으면 true.

```java
boolean result = names.stream()
        .anyMatch(name -> name.startsWith("b"));
```

의미:

```text
b로 시작하는 이름이 하나라도 있는가?
```

---

### 17.2 allMatch

전부 조건에 맞으면 true.

```java
boolean result = names.stream()
        .allMatch(name -> name.length() >= 3);
```

의미:

```text
모든 이름의 길이가 3 이상인가?
```

---

### 17.3 noneMatch

전부 조건에 맞지 않으면 true.

```java
boolean result = names.stream()
        .noneMatch(name -> name.isBlank());
```

의미:

```text
빈 문자열인 이름이 하나도 없는가?
```

---

## 18. findFirst

`findFirst`는 첫 번째 값을 찾는다.

```java
Optional<String> result = names.stream()
        .filter(name -> name.startsWith("b"))
        .findFirst();
```

결과 타입은 `Optional<String>`이다.

이유는 조건에 맞는 값이 없을 수도 있기 때문이다.

```java
String name = names.stream()
        .filter(n -> n.startsWith("b"))
        .findFirst()
        .orElse("없음");
```

---

## 19. Stream과 Optional의 관계

Stream에서 값을 하나 찾는 메서드는 보통 `Optional`을 반환한다.

```java
findFirst()
findAny()
max()
min()
reduce()
```

예시:

```java
Optional<Member> result = members.stream()
        .filter(member -> member.getKakaoId().equals(kakaoId))
        .findFirst();
```

의미:

```text
조건에 맞는 Member를 찾는다.
없을 수도 있으므로 Optional<Member>로 받는다.
```

---

## 20. 메서드 참조

Stream에서는 람다 대신 메서드 참조를 자주 사용한다.

```java
.map(name -> name.toUpperCase())
```

이 코드는 다음처럼 줄일 수 있다.

```java
.map(String::toUpperCase)
```

객체 필드 기준 정렬:

```java
.sorted(Comparator.comparing(member -> member.getCreatedAt()))
```

다음처럼 줄일 수 있다.

```java
.sorted(Comparator.comparing(Member::getCreatedAt))
```

---

## 21. DTO 변환에서 자주 쓰는 Stream

백엔드에서 가장 많이 보게 되는 Stream 패턴은 Entity 목록을 Response DTO 목록으로 바꾸는 코드다.

```java
List<MemberResponse> responses = members.stream()
        .map(member -> MemberResponse.from(member))
        .toList();
```

메서드 참조로 바꾸면 다음과 같다.

```java
List<MemberResponse> responses = members.stream()
        .map(MemberResponse::from)
        .toList();
```

의미:

```text
Member 엔티티 목록
→ MemberResponse DTO 목록
```

이 패턴은 Controller나 Service에서 자주 나온다.

---

## 22. Repository 결과와 Stream

Repository에서 여러 개를 조회하면 보통 List가 나온다.

```java
List<Member> members = memberRepository.findAll();
```

이 List를 Stream으로 가공할 수 있다.

```java
List<MemberResponse> responses = memberRepository.findAll().stream()
        .map(MemberResponse::from)
        .toList();
```

흐름:

```text
DB에서 Member 목록 조회
→ stream으로 변환
→ MemberResponse로 변환
→ List로 반환
```

---

## 23. Stream은 원본 데이터를 바꾸지 않는다

```java
List<String> names = new ArrayList<>(List.of("bonbon", "choco", "momo"));

List<String> result = names.stream()
        .map(String::toUpperCase)
        .toList();
```

`result`:

```text
[BONBON, CHOCO, MOMO]
```

`names`:

```text
[bonbon, choco, momo]
```

Stream은 보통 원본 컬렉션을 직접 바꾸지 않고, 새로운 결과를 만든다.

---

## 24. Stream은 재사용할 수 없다

Stream은 한 번 최종 연산을 수행하면 다시 사용할 수 없다.

```java
Stream<String> stream = names.stream();

stream.count();
stream.toList(); // 오류 발생 가능
```

필요하면 다시 Stream을 만들어야 한다.

```java
names.stream().count();
names.stream().toList();
```

---

## 25. Stream과 for문의 선택 기준

Stream이 항상 좋은 것은 아니다.

### Stream이 좋은 경우

```text
필터링
변환
정렬
그룹핑
DTO 변환
조건 검사
```

예시:

```java
List<MemberResponse> result = members.stream()
        .filter(member -> member.isActive())
        .map(MemberResponse::from)
        .toList();
```

### for문이 더 좋은 경우

```text
복잡한 분기
중간에 break/continue가 중요한 로직
디버깅이 많이 필요한 로직
여러 상태값을 계속 바꾸는 로직
```

예시:

```java
for (Member member : members) {
    if (!member.isActive()) {
        continue;
    }

    // 복잡한 비즈니스 로직
}
```

---

## 26. 자주 보는 패턴 정리

### 26.1 조건으로 걸러내기

```java
List<Member> activeMembers = members.stream()
        .filter(Member::isActive)
        .toList();
```

---

### 26.2 DTO로 변환하기

```java
List<MemberResponse> responses = members.stream()
        .map(MemberResponse::from)
        .toList();
```

---

### 26.3 특정 값만 뽑기

```java
List<String> nicknames = members.stream()
        .map(Member::getNickname)
        .toList();
```

---

### 26.4 특정 조건 존재 여부 확인

```java
boolean exists = members.stream()
        .anyMatch(member -> member.getKakaoId().equals(kakaoId));
```

---

### 26.5 첫 번째 값 찾기

```java
Optional<Member> member = members.stream()
        .filter(m -> m.getKakaoId().equals(kakaoId))
        .findFirst();
```

---

### 26.6 정렬 후 반환하기

```java
List<Member> sortedMembers = members.stream()
        .sorted(Comparator.comparing(Member::getCreatedAt).reversed())
        .toList();
```

---

## 27. 초보자가 자주 헷갈리는 부분

### 27.1 stream()은 DB 조회가 아니다

```java
members.stream()
```

이 코드는 이미 메모리에 있는 `members` 리스트를 Stream으로 바꾸는 것이다.

DB 조회는 보통 Repository가 한다.

```java
List<Member> members = memberRepository.findAll();
```

그 다음에 Stream으로 가공한다.

```java
members.stream()
        .map(MemberResponse::from)
        .toList();
```

---

### 27.2 filter와 map은 다르다

```text
filter → 남길지 말지 결정
map    → 다른 값으로 바꿈
```

예시:

```java
members.stream()
        .filter(Member::isActive)
        .map(MemberResponse::from)
        .toList();
```

흐름:

```text
활성 회원만 남긴다
→ Member를 MemberResponse로 바꾼다
→ List로 만든다
```

---

### 27.3 최종 연산이 없으면 실행되지 않는다

```java
members.stream()
        .filter(Member::isActive)
        .map(MemberResponse::from);
```

위 코드는 최종 연산이 없어서 결과를 만들지 않는다.

아래처럼 최종 연산이 있어야 한다.

```java
members.stream()
        .filter(Member::isActive)
        .map(MemberResponse::from)
        .toList();
```

---

## 28. MemberRepository와 연결해서 이해하기

`MemberRepository`에는 이런 메서드가 있었다.

```java
Optional<Member> findByKakaoId(Long kakaoId);
```

이건 DB에서 바로 카카오 ID로 한 명을 찾는 메서드다.

비슷한 일을 Stream으로 하면 다음처럼 쓸 수 있다.

```java
Optional<Member> member = members.stream()
        .filter(m -> m.getKakaoId().equals(kakaoId))
        .findFirst();
```

하지만 실제 서비스 코드에서는 보통 Repository 메서드를 쓰는 것이 좋다.

```java
Optional<Member> member = memberRepository.findByKakaoId(kakaoId);
```

차이:

```text
Repository findByKakaoId
→ DB에서 조건에 맞는 회원을 조회

Stream filter + findFirst
→ 이미 가져온 List 안에서 조건에 맞는 회원을 찾음
```

즉, DB에서 찾을 수 있는 조건은 Repository로 찾고, 이미 가져온 목록을 가공할 때 Stream을 쓴다.

---

## 29. 한 줄 요약

```text
Stream은 List, Set, 배열 같은 데이터를 필터링하고 변환하고 정렬해서 원하는 결과로 만드는 Java 기능이다.
```

핵심 공식:

```java
컬렉션.stream()
        .filter(조건)
        .map(변환)
        .toList();
```

외울 때는 이렇게 이해하면 된다.

```text
stream() → 데이터 흐름 시작
filter() → 조건에 맞는 것만 남김
map()    → 다른 형태로 바꿈
toList() → 결과를 List로 만듦
```
