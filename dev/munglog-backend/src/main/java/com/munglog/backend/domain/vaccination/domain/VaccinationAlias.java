package com.munglog.backend.domain.vaccination.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_vaccination_alias",
        uniqueConstraints = @UniqueConstraint(columnNames = {"alias"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class VaccinationAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vaccination_type_id", nullable = false)
    private VaccinationType vaccinationType;

    @Column(name = "alias", nullable = false, length = 200)
    private String alias;
}
