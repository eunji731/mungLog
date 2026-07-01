package com.munglog.backend.domain.member.repository;

import com.munglog.backend.domain.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * 회원 데이터 접근 인터페이스.
 * Member 엔티티의 DB 조회/저장/삭제를 담당하는 JPA Repository.
 * 주요 기능: 기본 CRUD (JpaRepository 상속), 카카오 ID로 회원 조회
 */
public interface MemberRepository extends JpaRepository<Member, UUID> {

    /**
     * [목적] 카카오 로그인 ID로 회원을 조회
     * [설명] OAuth2 로그인 처리 시 카카오 고유 ID로 기존 가입 여부를 확인할 때 사용한다.
     *        결과가 없으면 신규 가입 로직으로 분기된다.
     *
     * @param kakaoId 카카오에서 제공하는 사용자 고유 ID
     * @return 해당 카카오 ID의 회원 Optional (없으면 empty)
     */
    Optional<Member> findByKakaoId(Long kakaoId);
}
