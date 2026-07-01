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

/**
 * 예방접종 관리자 서비스.
 * 전역(글로벌) 접종 종류에 대한 관리자 전용 CRUD 및 사용자 생성 종류의 전역 병합을 담당하는 클래스.
 * 주요 기능: 전역 접종 종류 조회/생성/수정/비활성화, 사용자 생성 종류 조회, 전역 병합
 */
@Service
@RequiredArgsConstructor
public class VaccinationAdminService {

    private final VaccinationTypeRepository vaccinationTypeRepository;
    private final VaccinationAliasRepository vaccinationAliasRepository;
    private final CareRecordRepository careRecordRepository;

    /**
     * [목적] 전역(글로벌) 접종 종류 목록을 조회한다.
     * [설명] group이 null인 항목만 반환한다.
     *
     * @return 전역 접종 종류 응답 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<VaccinationTypeResponse> getGlobalTypes() {
        return vaccinationTypeRepository.findAll().stream()
                .filter(v -> v.getGroup() == null)
                .map(VaccinationTypeResponse::from)
                .toList();
    }

    /**
     * [목적] 새 전역 접종 종류를 생성한다.
     * [설명] group을 null로 설정하여 모든 그룹에서 공유되는 접종 종류로 등록한다.
     *
     * @param request 생성 요청 DTO
     * @return 생성된 접종 종류 응답 DTO
     */
    @Transactional
    public VaccinationTypeResponse createGlobalType(VaccinationTypeCreateRequest request) {
        VaccinationType saved = vaccinationTypeRepository.save(VaccinationType.builder()
                .group(null)
                .name(request.getName().trim())
                .intervalDays(request.getIntervalDays())
                .build());
        return VaccinationTypeResponse.from(saved);
    }

    /**
     * [목적] 전역 접종 종류를 수정한다.
     * [설명] 그룹 전용 항목은 수정할 수 없으며, 전역 항목만 수정 가능하다.
     *
     * @param id      수정할 접종 종류 ID
     * @param request 수정 요청 DTO
     * @return 수정된 접종 종류 응답 DTO
     * @throws IllegalArgumentException 해당 ID가 없거나 전역 종류가 아닐 경우
     */
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

    /**
     * [목적] 전역 접종 종류를 비활성화한다.
     * [설명] 그룹 전용 항목은 비활성화할 수 없으며, 전역 항목만 처리 가능하다.
     *
     * @param id 비활성화할 접종 종류 ID
     * @throws IllegalArgumentException 해당 ID가 없거나 전역 종류가 아닐 경우
     */
    @Transactional
    public void deactivateGlobalType(Long id) {
        VaccinationType type = vaccinationTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("접종종류를 찾을 수 없습니다."));
        if (type.getGroup() != null) {
            throw new IllegalArgumentException("개인 접종종류는 관리자 메뉴에서 삭제할 수 없습니다.");
        }
        type.deactivate();
    }

    /**
     * [목적] 사용자(그룹)가 생성한 활성 접종 종류를 모두 조회한다.
     * [설명] 관리자가 사용자 생성 종류를 검토하고 전역으로 승격(병합)할 때 활용한다.
     *
     * @return 사용자 생성 활성 접종 종류 응답 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<VaccinationTypeResponse> getUserCreatedTypes() {
        return vaccinationTypeRepository.findAllUserCreated().stream()
                .map(VaccinationTypeResponse::from)
                .toList();
    }

    /**
     * [목적] 사용자 생성 접종 종류를 전역 접종 종류로 병합한다.
     * [설명] 소스 종류를 참조하는 진료 기록을 대상 종류로 변경하고,
     *        소스 이름을 대상의 별칭으로 등록한 뒤 소스를 비활성화한다.
     *        대상은 반드시 전역(group=null) 접종 종류여야 한다.
     *
     * @param sourceId 병합될(비활성화될) 접종 종류 ID
     * @param targetId 병합 대상(전역) 접종 종류 ID
     * @throws IllegalArgumentException 해당 ID가 없거나 대상이 전역 종류가 아닐 경우
     */
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
