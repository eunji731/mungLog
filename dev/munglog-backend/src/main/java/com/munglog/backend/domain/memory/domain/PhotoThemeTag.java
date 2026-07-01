package com.munglog.backend.domain.memory.domain;

import com.munglog.backend.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

/**
 * 사진 테마 태그 엔티티.
 * 사진에 AI가 분석하여 부여한 테마 태그를 저장하는 JPA 엔티티 클래스.
 * 주요 기능: 사진별 테마 분류(예: 귀여운, 활기찬 등), 아카이브 테마 탭 분류에 활용
 */
@Entity
@Table(name = "tb_photo_theme_tag")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PhotoThemeTag extends BaseTimeEntity {

    /** 테마 태그의 고유 식별자 (UUID 자동 생성) */
    @Id
    @UuidGenerator
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** 태그가 붙은 사진 (지연 로딩) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "photo_id", nullable = false)
    private Photo photo;

    /** 테마 태그 값 (예: "귀여운", "활기찬", "편안한") */
    @Column(name = "tag", nullable = false)
    private String tag;
}
