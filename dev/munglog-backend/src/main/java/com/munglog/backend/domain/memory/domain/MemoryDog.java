package com.munglog.backend.domain.memory.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import com.munglog.backend.domain.pet.domain.Pet;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

/**
 * 일지-반려동물 연결 엔티티.
 * 특정 일지(Memory)에 어떤 반려동물이 등장했는지를 기록하는 중간 테이블 클래스.
 * 주요 기능: 일지와 반려동물 간의 다대다 관계를 일대다로 분리하여 역할 정보도 함께 저장
 */
@Entity
@Table(name = "tb_memory_dog")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MemoryDog extends BaseTimeEntity {

    /** 연결 레코드의 고유 식별자 (UUID 자동 생성) */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 연결된 일지 (지연 로딩) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memory_id", nullable = false)
    private Memory memory;

    /** 해당 일지에 등장한 반려동물 (지연 로딩) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dog_id", nullable = false)
    private Pet dog;

    /** 이 일지에서 반려동물의 역할 또는 메모 (예: 주인공, 동행 등) */
    @Column(name = "role")
    private String role;
}
