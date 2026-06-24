package com.munglog.backend.common.domain.code;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tb_code")
public class Code {

    @Id
    @Column(name = "code_id", length = 15)
    private String codeId;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CodeType type;

    @Column(name = "sort_order")
    private Integer sortOrder;

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
