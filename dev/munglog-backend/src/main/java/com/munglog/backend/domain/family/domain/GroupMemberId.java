package com.munglog.backend.domain.family.domain;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

/**
 * GroupMember의 복합 기본키 클래스.
 * JPA @EmbeddedId로 사용되며, groupId와 userId의 조합이 고유 키가 된다.
 * Serializable 구현은 JPA 복합키 규약에 따른 것이다.
 */
@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class GroupMemberId implements Serializable {

    /** 가족 그룹 UUID */
    private UUID groupId;

    /** 사용자 UUID */
    private UUID userId;
}
