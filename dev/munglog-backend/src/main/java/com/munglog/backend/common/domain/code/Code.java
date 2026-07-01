package com.munglog.backend.common.domain.code;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 시스템 공통 코드 엔티티 클래스.
 * 역할(ROLE), 상태 등 애플리케이션 전반에 걸쳐 사용되는 코드값을 관리한다.
 * 코드 ID는 외부에서 직접 주입하며, 시퀀스 기반 ID(IdGenerator)를 사용한다.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tb_code")
public class Code {

    /** 코드 고유 식별자 (IdGenerator로 생성, 예: COD00000000001) */
    @Id
    @Column(name = "code_id", length = 15)
    private String codeId;

    /** 실제 코드 값 (예: ROLE_USER) */
    @Column(nullable = false, length = 50)
    private String code;

    /** 코드 표시 이름 (예: 일반 사용자) */
    @Column(nullable = false, length = 100)
    private String name;

    /** 코드 분류 타입 (예: ROLE) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CodeType type;

    /** 목록 출력 순서 (오름차순 정렬) */
    @Column(name = "sort_order")
    private Integer sortOrder;

    /** 사용 여부 ("Y": 사용, "N": 미사용) */
    @Column(name = "use_yn", nullable = false, length = 1)
    private String useYn = "Y";

    @Builder
    public Code(String codeId, String code, String name, CodeType type, Integer sortOrder, String useYn) {
        this.codeId = codeId;
        this.code = code;
        this.name = name;
        this.type = type;
        this.sortOrder = sortOrder;
        this.useYn = useYn != null ? useYn : "Y";
    }
}
