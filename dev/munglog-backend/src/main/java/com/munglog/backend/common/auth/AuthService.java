package com.munglog.backend.common.auth;

import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.UUID;

/**
 * 인증 비즈니스 로직을 담당하는 서비스 클래스.
 * 액세스 토큰 재발급(reissue)과 로그아웃을 처리한다.
 * 리프레시 토큰은 해시(SHA-256)하여 DB에 저장하므로,
 * 토큰 원문이 유출되더라도 DB가 노출되지 않으면 안전하다.
 */
@RequiredArgsConstructor
@Service
public class AuthService {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;

    /**
     * [목적] 리프레시 토큰을 검증하여 새 액세스 토큰을 발급한다.
     * [설명] 1) JWT 유효성 검증 → 2) 회원 조회 → 3) DB에 저장된 해시와 일치 여부 확인
     *        → 4) 새 액세스·리프레시 토큰 발급 후 리프레시 토큰 해시를 DB에 갱신한다.
     *        리프레시 토큰도 재발급(Refresh Token Rotation)하여 탈취 시 재사용을 방지한다.
     *
     * @param refreshToken 클라이언트가 쿠키로 전달한 리프레시 토큰 원문
     * @return 새로 발급된 액세스 토큰
     * @throws IllegalArgumentException 토큰이 유효하지 않거나 사용자를 찾을 수 없는 경우
     */
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

    /**
     * [목적] 사용자의 리프레시 토큰을 무효화하여 로그아웃 처리한다.
     * [설명] DB의 refreshTokenHash를 null로 초기화하므로,
     *        이후 해당 토큰으로 재발급 시도 시 인증에 실패한다.
     *
     * @param userId 로그아웃할 사용자의 UUID
     */
    @Transactional
    public void logout(UUID userId) {
        memberRepository.findById(userId).ifPresent(member -> {
            member.invalidateToken();
            memberRepository.save(member);
        });
    }

    /**
     * [목적] 문자열을 SHA-256으로 해시한다.
     * [설명] 리프레시 토큰을 DB에 저장하기 전 해시 처리하여
     *        DB 유출 시에도 토큰 원문이 노출되지 않도록 한다.
     *
     * @param input 해시할 원문 문자열
     * @return 16진수 문자열로 변환된 SHA-256 해시값
     */
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
