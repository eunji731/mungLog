package com.munglog.backend.common.auth;

import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;

    @Transactional
    public String reissue(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }

        String userId = jwtTokenProvider.getUserId(refreshToken);
        Member member = memberRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        String tokenHash = sha256(refreshToken);
        if (!tokenHash.equals(member.getRefreshTokenHash())) {
            throw new IllegalArgumentException("토큰이 일치하지 않습니다.");
        }

        String newAccessToken = jwtTokenProvider.createAccessToken(userId, member.getRole());
        String newRefreshToken = jwtTokenProvider.createRefreshToken(userId, member.getRole());
        member.updateRefreshToken(sha256(newRefreshToken));
        memberRepository.save(member);

        return newAccessToken;
    }

    @Transactional
    public void logout(UUID userId) {
        memberRepository.findById(userId).ifPresent(member -> {
            member.invalidateToken();
            memberRepository.save(member);
        });
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
