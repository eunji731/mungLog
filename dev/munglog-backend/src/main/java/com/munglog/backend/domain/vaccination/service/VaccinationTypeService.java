package com.munglog.backend.domain.vaccination.service;

import com.munglog.backend.domain.care.domain.CareRecord;
import com.munglog.backend.domain.care.repository.CareRecordRepository;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import com.munglog.backend.domain.vaccination.domain.VaccinationAlias;
import com.munglog.backend.domain.vaccination.domain.VaccinationType;
import com.munglog.backend.domain.vaccination.dto.*;
import com.munglog.backend.domain.vaccination.repository.VaccinationAliasRepository;
import com.munglog.backend.domain.vaccination.repository.VaccinationTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VaccinationTypeService {

    private final VaccinationTypeRepository vaccinationTypeRepository;
    private final VaccinationAliasRepository vaccinationAliasRepository;
    private final MemberRepository memberRepository;
    private final CareRecordRepository careRecordRepository;

    @Transactional(readOnly = true)
    public List<VaccinationTypeResponse> getActiveTypes(UUID userId) {
        return vaccinationTypeRepository.findActiveByMember(userId)
                .stream().map(VaccinationTypeResponse::from).toList();
    }

    @Transactional
    public VaccinationTypeResponse createType(UUID userId, VaccinationTypeCreateRequest request) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        VaccinationType saved = vaccinationTypeRepository.save(VaccinationType.builder()
                .member(member)
                .name(request.getName().trim())
                .intervalDays(request.getIntervalDays())
                .build());
        return VaccinationTypeResponse.from(saved);
    }

    @Transactional
    public VaccinationTypeResponse updateType(UUID userId, Long typeId, VaccinationTypeCreateRequest request) {
        VaccinationType type = findUserOwnedType(typeId, userId);
        type.update(request.getName().trim(), request.getIntervalDays());
        return VaccinationTypeResponse.from(type);
    }

    @Transactional
    public void deactivateType(UUID userId, Long typeId) {
        VaccinationType type = findUserOwnedType(typeId, userId);
        type.deactivate();
    }

    @Transactional
    public void mergeTypes(UUID userId, VaccinationMergeRequest request) {
        VaccinationType source = findAccessibleType(request.getSourceId(), userId);
        VaccinationType target = findAccessibleType(request.getTargetId(), userId);

        // 기존 케어 기록에서 sourceId → targetId 일괄 교체
        List<CareRecord> affected = careRecordRepository.findByVaccinationTypeId(request.getSourceId());
        affected.forEach(r -> r.updateVaccinationType(target));

        // source 이름을 target의 alias로 등록
        if (!vaccinationAliasRepository.existsByAlias(source.getName())) {
            vaccinationAliasRepository.save(VaccinationAlias.builder()
                    .vaccinationType(target)
                    .alias(source.getName())
                    .build());
        }

        source.mergeTo(target.getId());
    }

    @Transactional(readOnly = true)
    public List<VaccinationAliasMatchResponse> matchAlias(String keyword) {
        if (keyword == null || keyword.isBlank()) return List.of();

        // 완전 일치 우선
        var exact = vaccinationAliasRepository.findByAliasIgnoreCase(keyword.trim());
        if (exact.isPresent()) {
            return List.of(VaccinationAliasMatchResponse.from(exact.get()));
        }

        // 부분 일치
        return vaccinationAliasRepository.findByAliasContainingIgnoreCase(keyword.trim())
                .stream().map(VaccinationAliasMatchResponse::from).toList();
    }

    @Transactional
    public void addAlias(UUID userId, Long typeId, String alias) {
        VaccinationType type = findAccessibleType(typeId, userId);
        if (vaccinationAliasRepository.existsByAlias(alias.trim())) {
            throw new IllegalArgumentException("이미 등록된 별칭입니다: " + alias);
        }
        vaccinationAliasRepository.save(VaccinationAlias.builder()
                .vaccinationType(type)
                .alias(alias.trim())
                .build());
    }

    private VaccinationType findUserOwnedType(Long typeId, UUID userId) {
        VaccinationType type = vaccinationTypeRepository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("접종종류를 찾을 수 없습니다."));
        if (type.getMember() == null || !type.getMember().getId().equals(userId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다. 기본 제공 접종종류는 수정할 수 없습니다.");
        }
        return type;
    }

    private VaccinationType findAccessibleType(Long typeId, UUID userId) {
        VaccinationType type = vaccinationTypeRepository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("접종종류를 찾을 수 없습니다."));
        if (type.getMember() != null && !type.getMember().getId().equals(userId)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }
        return type;
    }
}
