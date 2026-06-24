package com.munglog.backend.common.auth;

import com.munglog.backend.common.auth.dto.OAuthAttributes;
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

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;

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

    private Member saveOrUpdate(OAuthAttributes attributes) {
        return memberRepository.findByKakaoId(attributes.getKakaoId())
                .map(member -> {
                    if (member.getIsActive()) {
                        member.update(attributes.getNickname(), attributes.getProfileImageUrl());
                    }
                    return memberRepository.save(member);
                })
                .orElseGet(() -> memberRepository.save(attributes.toEntity()));
    }
}
