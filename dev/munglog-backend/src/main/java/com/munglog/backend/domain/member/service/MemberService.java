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
import com.munglog.backend.domain.pet.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PetRepository petRepository;
    private final AttachedFileService attachedFileService;
    private final FileStorageService fileStorageService;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional(readOnly = true)
    public MemberResponse getMe(UUID userId) {
        Member member = findById(userId);
        String imageUrl = resolveProfileUrl(userId, member.getProfileImagePath());
        return MemberResponse.from(member, imageUrl);
    }

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

    @Transactional
    public void updateAiContext(UUID userId, String aiContext) {
        Member member = findById(userId);
        member.updateAiContext(aiContext);
        memberRepository.save(member);
    }

    @Transactional
    public void withdraw(UUID userId) {
        Member member = findById(userId);
        member.withdraw();
        petRepository.findByUserId(userId).forEach(pet -> pet.delete());
        memberRepository.save(member);
    }

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

    private String resolveProfileUrl(UUID userId, String fallbackPath) {
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.MEMBER_PROFILE, userId);
        if (!files.isEmpty()) return files.get(0).getFileUrl();
        if (fallbackPath != null) return fileStorageService.getFileUrl(fallbackPath);
        return null;
    }

    private Member findById(UUID userId) {
        return memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}
