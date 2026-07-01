package com.munglog.backend.common.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * 생성일시/수정일시를 자동으로 관리하는 JPA Auditing 기반 추상 클래스.
 * 모든 엔티티가 이 클래스를 상속하면 createdAt, updatedAt이 자동으로 채워진다.
 * MunglogBackendApplication의 @EnableJpaAuditing이 활성화되어야 동작한다.
 */
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseTimeEntity {

    /** 엔티티 최초 저장 시 자동 설정되는 생성 일시 (이후 변경 불가) */
    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt;

    /** 엔티티가 수정될 때마다 자동 갱신되는 수정 일시 */
    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;
}
