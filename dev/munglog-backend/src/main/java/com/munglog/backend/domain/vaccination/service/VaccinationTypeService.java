package com.munglog.backend.domain.vaccination.service;

import com.munglog.backend.domain.care.domain.CareRecord;
import com.munglog.backend.domain.care.repository.CareRecordRepository;
import com.munglog.backend.domain.family.domain.FamilyGroup;
import com.munglog.backend.domain.family.service.FamilyGroupService;
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

/**
 * 예방접종 종류 서비스.
 * 사용자(그룹)가 사용하는 접종 종류의 CRUD, 병합, 별칭 관리 비즈니스 로직을 담당하는 클래스.
 * 전역 항목과 그룹 전용 항목을 함께 관리하며, 별칭 검색을 통해 AI 분석 결과와 매핑한다.
 * 주요 기능: 활성 목록 조회, 그룹 전용 종류 추가/수정/비활성화, 병합, 별칭 검색/추가
 */
@Service
@RequiredArgsConstructor
public class VaccinationTypeService {

    private final VaccinationTypeRepository vaccinationTypeRepository;
    private final VaccinationAliasRepository vaccinationAliasRepository;
    private final FamilyGroupService familyGroupService;
    private final CareRecordRepository careRecordRepository;

    /**
     * [목적] 현재 사용자 그룹에서 사용 가능한 활성 접종 종류 목록을 조회한다.
     * [설명] 전역 접종 종류와 그룹 전용 접종 종류를 함께 반환한다.
     *
     * @param userId 요청 사용자 UUID
     * @return 활성 접종 종류 응답 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<VaccinationTypeResponse> getActiveTypes(UUID userId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        return vaccinationTypeRepository.findActiveByGroup(groupId)
                .stream().map(VaccinationTypeResponse::from).toList();
    }

    /**
     * [목적] 그룹 전용 접종 종류를 새로 추가한다.
     *
     * @param userId  요청 사용자 UUID
     * @param request 생성 요청 DTO
     * @return 생성된 접종 종류 응답 DTO
     */
    @Transactional
    public VaccinationTypeResponse createType(UUID userId, VaccinationTypeCreateRequest request) {
        FamilyGroup group = familyGroupService.getGroupByUserId(userId);
        VaccinationType saved = vaccinationTypeRepository.save(VaccinationType.builder()
                .group(group)
                .name(request.getName().trim())
                .intervalDays(request.getIntervalDays())
                .build());
        return VaccinationTypeResponse.from(saved);
    }

    /**
     * [목적] 그룹이 소유한 접종 종류를 수정한다.
     * [설명] 전역 항목이나 다른 그룹의 항목은 수정할 수 없다.
     *
     * @param userId  요청 사용자 UUID
     * @param typeId  수정할 접종 종류 ID
     * @param request 수정 요청 DTO
     * @return 수정된 접종 종류 응답 DTO
     * @throws IllegalArgumentException 해당 접종 종류가 없거나 수정 권한이 없을 경우
     */
    @Transactional
    public VaccinationTypeResponse updateType(UUID userId, Long typeId, VaccinationTypeCreateRequest request) {
        VaccinationType type = findGroupOwnedType(typeId, userId);
        type.update(request.getName().trim(), request.getIntervalDays());
        return VaccinationTypeResponse.from(type);
    }

    /**
     * [목적] 그룹이 소유한 접종 종류를 비활성화한다.
     *
     * @param userId 요청 사용자 UUID
     * @param typeId 비활성화할 접종 종류 ID
     * @throws IllegalArgumentException 해당 접종 종류가 없거나 수정 권한이 없을 경우
     */
    @Transactional
    public void deactivateType(UUID userId, Long typeId) {
        VaccinationType type = findGroupOwnedType(typeId, userId);
        type.deactivate();
    }

    /**
     * [목적] 두 접종 종류를 병합한다.
     * [설명] 소스 종류를 참조하는 진료 기록을 대상 종류로 변경하고,
     *        소스 이름을 대상의 별칭으로 등록한 뒤 소스를 비활성화한다.
     *
     * @param userId  요청 사용자 UUID
     * @param request 병합 요청 DTO (sourceId, targetId)
     * @throws IllegalArgumentException 접근 권한이 없거나 해당 종류를 찾을 수 없을 경우
     */
    @Transactional
    public void mergeTypes(UUID userId, VaccinationMergeRequest request) {
        VaccinationType source = findAccessibleType(request.getSourceId(), userId);
        VaccinationType target = findAccessibleType(request.getTargetId(), userId);

        List<CareRecord> affected = careRecordRepository.findByVaccinationTypeId(request.getSourceId());
        affected.forEach(r -> r.updateVaccinationType(target));

        if (!vaccinationAliasRepository.existsByAlias(source.getName())) {
            vaccinationAliasRepository.save(VaccinationAlias.builder()
                    .vaccinationType(target)
                    .alias(source.getName())
                    .build());
        }

        source.mergeTo(target.getId());
    }

    /**
     * [목적] 별칭으로 접종 종류를 검색한다.
     * [설명] 정확히 일치하는 별칭을 먼저 찾고, 없으면 포함 검색 결과를 반환한다.
     *        키워드가 공백이면 빈 목록을 반환한다.
     *
     * @param keyword 검색 키워드
     * @return 매칭된 접종 종류 별칭 응답 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<VaccinationAliasMatchResponse> matchAlias(String keyword) {
        if (keyword == null || keyword.isBlank()) return List.of();

        var exact = vaccinationAliasRepository.findByAliasIgnoreCase(keyword.trim());
        if (exact.isPresent()) {
            return List.of(VaccinationAliasMatchResponse.from(exact.get()));
        }

        return vaccinationAliasRepository.findByAliasContainingIgnoreCase(keyword.trim())
                .stream().map(VaccinationAliasMatchResponse::from).toList();
    }

    /**
     * [목적] 접근 가능한 접종 종류에 별칭을 추가한다.
     * [설명] 이미 동일한 별칭이 존재하면 예외를 발생시킨다.
     *
     * @param userId 요청 사용자 UUID
     * @param typeId 별칭을 추가할 접종 종류 ID
     * @param alias  추가할 별칭 문자열
     * @throws IllegalArgumentException 별칭이 이미 존재하거나 접근 권한이 없을 경우
     */
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

    /**
     * [목적] 그룹이 소유한 접종 종류를 조회하고 권한을 검증한다.
     * [설명] 전역 항목이거나 다른 그룹의 항목이면 예외를 발생시킨다.
     *
     * @param typeId 조회할 접종 종류 ID
     * @param userId 요청 사용자 UUID
     * @return 그룹 소유 접종 종류 엔티티
     * @throws IllegalArgumentException 접종 종류가 없거나 수정 권한이 없을 경우
     */
    private VaccinationType findGroupOwnedType(Long typeId, UUID userId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        VaccinationType type = vaccinationTypeRepository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("접종종류를 찾을 수 없습니다."));
        if (type.getGroup() == null || !type.getGroup().getId().equals(groupId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다. 기본 제공 접종종류는 수정할 수 없습니다.");
        }
        return type;
    }

    /**
     * [목적] 접근 가능한 접종 종류를 조회한다.
     * [설명] 전역 항목은 누구나 접근 가능하며, 그룹 전용 항목은 해당 그룹만 접근 가능하다.
     *
     * @param typeId 조회할 접종 종류 ID
     * @param userId 요청 사용자 UUID
     * @return 접종 종류 엔티티
     * @throws IllegalArgumentException 접종 종류가 없거나 접근 권한이 없을 경우
     */
    private VaccinationType findAccessibleType(Long typeId, UUID userId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        VaccinationType type = vaccinationTypeRepository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("접종종류를 찾을 수 없습니다."));
        if (type.getGroup() != null && !type.getGroup().getId().equals(groupId)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }
        return type;
    }
}
