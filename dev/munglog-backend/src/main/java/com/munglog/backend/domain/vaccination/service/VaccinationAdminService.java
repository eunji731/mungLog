package com.munglog.backend.domain.vaccination.service;

import com.munglog.backend.domain.care.repository.CareRecordRepository;
import com.munglog.backend.domain.vaccination.domain.VaccinationAlias;
import com.munglog.backend.domain.vaccination.domain.VaccinationType;
import com.munglog.backend.domain.vaccination.dto.VaccinationTypeCreateRequest;
import com.munglog.backend.domain.vaccination.dto.VaccinationTypeResponse;
import com.munglog.backend.domain.vaccination.repository.VaccinationAliasRepository;
import com.munglog.backend.domain.vaccination.repository.VaccinationTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VaccinationAdminService {

    private final VaccinationTypeRepository vaccinationTypeRepository;
    private final VaccinationAliasRepository vaccinationAliasRepository;
    private final CareRecordRepository careRecordRepository;

    @Transactional(readOnly = true)
    public List<VaccinationTypeResponse> getGlobalTypes() {
        return vaccinationTypeRepository.findAll().stream()
                .filter(v -> v.getGroup() == null)
                .map(VaccinationTypeResponse::from)
                .toList();
    }

    @Transactional
    public VaccinationTypeResponse createGlobalType(VaccinationTypeCreateRequest request) {
        VaccinationType saved = vaccinationTypeRepository.save(VaccinationType.builder()
                .group(null)
                .name(request.getName().trim())
                .intervalDays(request.getIntervalDays())
                .build());
        return VaccinationTypeResponse.from(saved);
    }

    @Transactional
    public VaccinationTypeResponse updateGlobalType(Long id, VaccinationTypeCreateRequest request) {
        VaccinationType type = vaccinationTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("접종종류를 찾을 수 없습니다."));
        if (type.getGroup() != null) {
            throw new IllegalArgumentException("개인 접종종류는 관리자 메뉴에서 수정할 수 없습니다.");
        }
        type.update(request.getName().trim(), request.getIntervalDays());
        return VaccinationTypeResponse.from(type);
    }

    @Transactional
    public void deactivateGlobalType(Long id) {
        VaccinationType type = vaccinationTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("접종종류를 찾을 수 없습니다."));
        if (type.getGroup() != null) {
            throw new IllegalArgumentException("개인 접종종류는 관리자 메뉴에서 삭제할 수 없습니다.");
        }
        type.deactivate();
    }

    @Transactional(readOnly = true)
    public List<VaccinationTypeResponse> getUserCreatedTypes() {
        return vaccinationTypeRepository.findAllUserCreated().stream()
                .map(VaccinationTypeResponse::from)
                .toList();
    }

    @Transactional
    public void mergeUserTypeToGlobal(Long sourceId, Long targetId) {
        VaccinationType source = vaccinationTypeRepository.findById(sourceId)
                .orElseThrow(() -> new IllegalArgumentException("소스 접종종류를 찾을 수 없습니다."));
        VaccinationType target = vaccinationTypeRepository.findById(targetId)
                .orElseThrow(() -> new IllegalArgumentException("대상 접종종류를 찾을 수 없습니다."));

        if (target.getGroup() != null) {
            throw new IllegalArgumentException("병합 대상은 글로벌 접종종류여야 합니다.");
        }

        careRecordRepository.findByVaccinationTypeId(sourceId)
                .forEach(r -> r.updateVaccinationType(target));

        if (!vaccinationAliasRepository.existsByAlias(source.getName())) {
            vaccinationAliasRepository.save(VaccinationAlias.builder()
                    .vaccinationType(target)
                    .alias(source.getName())
                    .build());
        }

        source.mergeTo(target.getId());
    }
}
