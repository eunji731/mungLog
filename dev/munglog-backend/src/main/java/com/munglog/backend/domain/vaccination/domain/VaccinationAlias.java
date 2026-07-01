package com.munglog.backend.domain.vaccination.domain;

import jakarta.persistence.*;
import lombok.*;

/**
 * 예방접종 별칭 엔티티.
 * 하나의 예방접종 종류(VaccinationType)에 연결된 별명·동의어를 저장하는 클래스.
 * AI 분석 시 다양한 표기를 하나의 접종 종류로 매핑할 때 사용한다.
 * 예) "종합백신(DHPPL)" 의 별칭: "DHPPL", "종합백신", "5종백신"
 */
@Entity
@Table(name = "tb_vaccination_alias",
        uniqueConstraints = @UniqueConstraint(columnNames = {"alias"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class VaccinationAlias {

    /** 기본 키 (자동 증가) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 이 별칭이 매핑되는 예방접종 종류 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vaccination_type_id", nullable = false)
    private VaccinationType vaccinationType;

    /** 별칭 문자열 (시스템 전체에서 유일) */
    @Column(name = "alias", nullable = false, length = 200)
    private String alias;
}
