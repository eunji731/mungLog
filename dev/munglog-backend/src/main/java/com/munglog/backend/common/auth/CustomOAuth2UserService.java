package com.munglog.backend.common.auth;

import com.munglog.backend.common.auth.dto.OAuthAttributes;
import com.munglog.backend.domain.family.service.FamilyGroupService;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * 카카오 OAuth2 로그인 후 사용자 정보를 처리하는 서비스 클래스.
 * Spring Security의 DefaultOAuth2UserService를 확장하여
 * 카카오에서 받은 사용자 정보를 DB에 저장하거나 업데이트한다.
 * 신규 회원이면 자동으로 개인 가족 그룹도 생성한다.
 */
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;
    private final FamilyGroupService familyGroupService;

    /**
     * [목적] 카카오에서 받은 사용자 정보로 회원을 저장하거나 업데이트하고 Spring Security 사용자 객체를 반환한다.
     * [설명] 카카오 OAuth2 인증 성공 후 자동 호출된다.
     *        기존 회원이면 닉네임·프로필 이미지 업데이트, 신규 회원이면 DB 저장 + 가족 그룹 생성.
     *
     * @param userRequest 카카오로부터 받은 OAuth2 사용자 요청 정보
     * @return Spring Security가 인식하는 OAuth2 사용자 객체
     * @throws OAuth2AuthenticationException OAuth2 인증 처리 중 오류 발생 시
     */
    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        OAuthAttributes attributes = OAuthAttributes.ofKakao(oAuth2User.getAttributes());
        Member member = saveOrUpdate(attributes);

        return new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority(member.getRole())),
                Map.of("id", member.getId().toString()),
                "id"
        );
    }

    /**
     * [목적] 카카오 ID를 기준으로 회원을 찾아 저장하거나 정보를 업데이트한다.
     * [설명] 이미 가입된 회원(카카오 ID 일치)이면 닉네임과 프로필 이미지를 갱신하고,
     *        신규 회원이면 DB에 저장 후 개인 가족 그룹을 자동 생성한다.
     *        탈퇴 처리(isActive=false)된 회원은 정보를 업데이트하지 않는다.
     *
     * @param attributes 카카오에서 파싱한 사용자 속성 DTO
     * @return 저장 또는 업데이트된 회원 엔티티
     */
    private Member saveOrUpdate(OAuthAttributes attributes) {
        return memberRepository.findByKakaoId(attributes.getKakaoId())
                .map(member -> {
                    if (member.getIsActive()) {
                        member.update(attributes.getNickname(), attributes.getProfileImageUrl());
                    }
                    return memberRepository.save(member);
                })
                .orElseGet(() -> {
                    Member newMember = memberRepository.save(attributes.toEntity());
                    familyGroupService.createGroupForNewMember(newMember);
                    return newMember;
                });
    }
}
