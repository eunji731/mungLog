package com.munglog.backend.domain.member.service;

import com.munglog.backend.common.auth.JwtTokenProvider;
import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.common.file.service.AttachedFileService;
import com.munglog.backend.common.file.service.FileStorageService;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.dto.MemberResponse;
import com.munglog.backend.domain.member.dto.MemberUpdateRequest;
import com.munglog.backend.domain.member.repository.MemberRepository;
import com.munglog.backend.domain.family.repository.GroupMemberRepository;
import com.munglog.backend.domain.pet.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * 회원 서비스.
 * 회원 정보 조회·수정, AI 컨텍스트 관리, 탈퇴 및 재가입 비즈니스 로직을 처리하는 클래스.
 * 주요 기능: 내 정보 조회/수정, AI 컨텍스트 업데이트, 회원 탈퇴, 재가입 처리
 */
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PetRepository petRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final AttachedFileService attachedFileService;
    private final FileStorageService fileStorageService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * [목적] 현재 로그인한 사용자의 프로필 정보를 조회
     * [설명] userId로 회원을 조회하고, 프로필 이미지 URL을 함께 계산하여 반환한다.
     *
     * @param userId 현재 로그인한 사용자의 UUID
     * @return 회원 상세 정보 DTO
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
    @Transactional(readOnly = true)
    public MemberResponse getMe(UUID userId) {
        Member member = findById(userId);
        String imageUrl = resolveProfileUrl(userId, member.getProfileImagePath());
        return MemberResponse.from(member, imageUrl);
    }

    /**
     * [목적] 사용자의 닉네임과 프로필 이미지를 수정
     * [설명] 새 프로필 이미지가 있으면 기존 이미지를 교체하고, 닉네임을 업데이트한다.
     *        이미지가 없으면 기존 이미지를 유지한다.
     *
     * @param userId       현재 로그인한 사용자의 UUID
     * @param request      수정할 닉네임이 담긴 요청 DTO
     * @param profileImage (선택) 새로 업로드할 프로필 이미지
     * @return 수정된 회원 정보 DTO
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
    @Transactional
    public MemberResponse updateMe(UUID userId, MemberUpdateRequest request, MultipartFile profileImage) {
        Member member = findById(userId);

        if (profileImage != null && !profileImage.isEmpty()) {
            attachedFileService.replaceSingle(ParentDomainType.MEMBER_PROFILE, userId, profileImage);
        }

        member.updateProfile(request.nickname(), null);
        memberRepository.save(member);

        String imageUrl = resolveProfileUrl(userId, member.getProfileImagePath());
        return MemberResponse.from(member, imageUrl);
    }

    /**
     * [목적] AI 다이어리 생성에 사용할 배경 정보를 저장
     * [설명] 사용자가 작성한 AI 컨텍스트를 회원 엔티티에 저장한다.
     *        이 정보는 AI가 맞춤형 다이어리를 작성할 때 프롬프트에 포함된다.
     *
     * @param userId    현재 로그인한 사용자의 UUID
     * @param aiContext 저장할 AI 컨텍스트 문자열
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
    @Transactional
    public void updateAiContext(UUID userId, String aiContext) {
        Member member = findById(userId);
        member.updateAiContext(aiContext);
        memberRepository.save(member);
    }

    /**
     * [목적] 회원 탈퇴 처리
     * [설명] 계정을 비활성화하고 토큰을 무효화한다.
     *        사용자가 등록한 반려동물도 함께 비활성화(소프트 삭제)된다.
     *
     * @param userId 탈퇴할 사용자의 UUID
     * @throws IllegalArgumentException 사용자를 찾을 수 없는 경우
     */
    @Transactional
    public void withdraw(UUID userId) {
        Member member = findById(userId);
        member.withdraw();
        groupMemberRepository.findGroupIdByUserId(userId)
                .ifPresent(groupId -> petRepository.findByGroupId(groupId).forEach(pet -> pet.delete()));
        memberRepository.save(member);
    }

    /**
     * [목적] 탈퇴한 사용자의 계정을 재활성화 (재가입)
     * [설명] 재가입 전용 JWT 토큰을 검증한 뒤 계정을 복구한다.
     *        토큰의 유효성, 타입(rejoin), userId 일치 여부를 순차적으로 검증한다.
     *
     * @param userId      현재 요청 사용자의 UUID
     * @param rejoinToken 재가입 전용 JWT 토큰
     * @throws IllegalArgumentException 토큰이 유효하지 않거나 타입이 rejoin이 아닌 경우
     * @throws SecurityException        토큰의 userId와 현재 사용자가 불일치하는 경우
     */
    @Transactional
    public void rejoin(UUID userId, String rejoinToken) {
        if (!jwtTokenProvider.validateToken(rejoinToken)) {
            throw new IllegalArgumentException("유효하지 않은 재가입 토큰입니다.");
        }
        if (!jwtTokenProvider.isRejoinToken(rejoinToken)) {
            throw new IllegalArgumentException("재가입 토큰이 아닙니다.");
        }
        String tokenUserId = jwtTokenProvider.getUserId(rejoinToken);
        if (!userId.toString().equals(tokenUserId)) {
            throw new SecurityException("토큰이 일치하지 않습니다.");
        }

        Member member = findById(userId);
        member.reactivate();
        memberRepository.save(member);
    }

    /**
     * [목적] 프로필 이미지 URL을 결정하는 헬퍼 메소드
     * [설명] AttachedFile 테이블에 저장된 이미지를 우선 사용하고,
     *        없으면 회원 엔티티의 profileImagePath를 URL로 변환하여 반환한다.
     *
     * @param userId       사용자의 UUID (AttachedFile 조회에 사용)
     * @param fallbackPath 첨부 파일이 없을 때 사용할 대체 경로
     * @return 프로필 이미지 URL, 둘 다 없으면 null
     */
    private String resolveProfileUrl(UUID userId, String fallbackPath) {
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.MEMBER_PROFILE, userId);
        if (!files.isEmpty()) return files.get(0).getFileUrl();
        if (fallbackPath != null) return fileStorageService.getFileUrl(fallbackPath);
        return null;
    }

    /**
     * [목적] userId로 회원을 조회하는 내부 헬퍼 메소드
     * [설명] 사용자를 찾지 못하면 예외를 발생시켜 서비스 전반에서 공통으로 처리한다.
     *
     * @param userId 조회할 사용자의 UUID
     * @return 조회된 Member 엔티티
     * @throws IllegalArgumentException 해당 userId의 사용자가 없는 경우
     */
    private Member findById(UUID userId) {
        return memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}
