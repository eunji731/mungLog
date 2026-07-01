package com.munglog.backend.domain.symptom.service;

import com.munglog.backend.domain.symptom.domain.CareRecordSymptom;
import com.munglog.backend.domain.symptom.domain.ScheduleSymptom;
import com.munglog.backend.domain.symptom.domain.SymptomMaster;
import com.munglog.backend.domain.symptom.domain.SymptomSnapSymptom;
import com.munglog.backend.domain.symptom.dto.SymptomResponse;
import com.munglog.backend.domain.symptom.repository.CareRecordSymptomRepository;
import com.munglog.backend.domain.symptom.repository.ScheduleSymptomRepository;
import com.munglog.backend.domain.symptom.repository.SymptomMasterRepository;
import com.munglog.backend.domain.symptom.repository.SymptomSnapSymptomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 증상 서비스.
 * 증상 마스터 CRUD 및 진료 기록·일정·증상 스냅과의 증상 태그 동기화를 담당하는 클래스.
 * 주요 기능: 증상 검색, 생성/수정/비활성화/활성화, 병합, 각 도메인별 증상 태그 동기화 및 조회
 */
@Service
@RequiredArgsConstructor
public class SymptomService {

    private final SymptomMasterRepository symptomMasterRepository;
    private final CareRecordSymptomRepository careRecordSymptomRepository;
    private final ScheduleSymptomRepository scheduleSymptomRepository;
    private final SymptomSnapSymptomRepository symptomSnapSymptomRepository;

    /**
     * [목적] 키워드로 증상 마스터를 검색한다.
     * [설명] 증상명에 키워드가 포함된 항목을 대소문자 무관으로 조회한다.
     *
     * @param keyword 검색 키워드
     * @return 키워드가 포함된 증상 응답 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<SymptomResponse> searchSymptoms(String keyword) {
        return symptomMasterRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(SymptomResponse::from).toList();
    }

    // ─── Admin CRUD ────────────────────────────────────────────────

    /**
     * [목적] 모든 증상 마스터를 활성 우선·이름 오름차순으로 조회한다.
     *
     * @return 전체 증상 응답 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<SymptomResponse> getAllSymptoms() {
        return symptomMasterRepository.findAllByOrderByIsActiveDescNameAsc().stream()
                .map(SymptomResponse::from).toList();
    }

    /**
     * [목적] 새 증상을 마스터에 등록한다.
     * [설명] 동일한 이름이 이미 존재하면 예외를 발생시킨다.
     *
     * @param name 등록할 증상명
     * @return 등록된 증상 응답 DTO
     * @throws IllegalArgumentException 동일한 이름의 증상이 이미 존재할 경우
     */
    @Transactional
    public SymptomResponse createSymptom(String name) {
        if (symptomMasterRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 증상입니다: " + name);
        }
        SymptomMaster symptom = symptomMasterRepository.save(SymptomMaster.builder().name(name).build());
        return SymptomResponse.from(symptom);
    }

    /**
     * [목적] 증상명을 수정한다.
     *
     * @param id   수정할 증상 ID
     * @param name 새 증상명
     * @return 수정된 증상 응답 DTO
     * @throws IllegalArgumentException 해당 ID의 증상이 없을 경우
     */
    @Transactional
    public SymptomResponse updateSymptom(Long id, String name) {
        SymptomMaster symptom = symptomMasterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("증상을 찾을 수 없습니다."));
        symptom.updateName(name);
        return SymptomResponse.from(symptom);
    }

    /**
     * [목적] 증상을 비활성화(소프트 삭제)한다.
     *
     * @param id 비활성화할 증상 ID
     * @throws IllegalArgumentException 해당 ID의 증상이 없을 경우
     */
    @Transactional
    public void deactivateSymptom(Long id) {
        SymptomMaster symptom = symptomMasterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("증상을 찾을 수 없습니다."));
        symptom.deactivate();
    }

    /**
     * [목적] 비활성화된 증상을 다시 활성화한다.
     *
     * @param id 활성화할 증상 ID
     * @throws IllegalArgumentException 해당 ID의 증상이 없을 경우
     */
    @Transactional
    public void activateSymptom(Long id) {
        SymptomMaster symptom = symptomMasterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("증상을 찾을 수 없습니다."));
        symptom.activate();
    }

    /**
     * [목적] 두 증상을 병합한다.
     * [설명] sourceId를 참조하는 모든 레코드(진료·일정·스냅)를 targetId로 변경한 후 sourceId를 삭제한다.
     *        동의어나 중복 증상을 하나로 합칠 때 사용한다.
     *
     * @param sourceId 병합될(삭제될) 증상 ID
     * @param targetId 병합 대상(유지될) 증상 ID
     * @throws IllegalArgumentException 소스 또는 대상 증상이 없을 경우
     */
    @Transactional
    public void mergeSymptoms(Long sourceId, Long targetId) {
        SymptomMaster source = symptomMasterRepository.findById(sourceId)
                .orElseThrow(() -> new IllegalArgumentException("소스 증상을 찾을 수 없습니다."));
        if (!symptomMasterRepository.existsById(targetId)) {
            throw new IllegalArgumentException("대상 증상을 찾을 수 없습니다.");
        }
        careRecordSymptomRepository.updateSymptomId(sourceId, targetId);
        scheduleSymptomRepository.updateSymptomId(sourceId, targetId);
        symptomSnapSymptomRepository.updateSymptomId(sourceId, targetId);
        symptomMasterRepository.delete(source);
    }

    /**
     * [목적] 이름으로 증상을 조회하고, 없으면 새로 생성하여 반환한다.
     * [설명] 사용자가 자유 입력한 증상 태그를 마스터에 자동 등록할 때 사용한다.
     *
     * @param name 증상명
     * @return 기존 또는 새로 생성된 SymptomMaster 엔티티
     */
    @Transactional
    public SymptomMaster getOrCreateSymptom(String name) {
        return symptomMasterRepository.findByName(name)
                .orElseGet(() -> symptomMasterRepository.save(SymptomMaster.builder().name(name).build()));
    }

    /**
     * [목적] 진료 기록의 증상 태그를 동기화한다.
     * [설명] 기존 증상 연결을 모두 삭제한 후 새 목록으로 재등록한다.
     *
     * @param careRecordId 동기화할 진료 기록 UUID
     * @param petId        해당 반려동물 UUID
     * @param symptomNames 새 증상명 목록 (null이면 삭제만 수행)
     * @param severityCode 증상 심각도 코드
     */
    @Transactional
    public void syncCareRecordSymptoms(UUID careRecordId, UUID petId, List<String> symptomNames, String severityCode) {
        careRecordSymptomRepository.deleteAllByCareRecordId(careRecordId);
        if (symptomNames == null) return;
        for (String name : symptomNames) {
            SymptomMaster symptom = getOrCreateSymptom(name);
            careRecordSymptomRepository.save(CareRecordSymptom.builder()
                    .careRecordId(careRecordId).symptomId(symptom.getId())
                    .petId(petId).severityCode(severityCode)
                    .build());
        }
    }

    /**
     * [목적] 일정의 증상 태그를 동기화한다.
     * [설명] 기존 증상 연결을 모두 삭제한 후 새 목록으로 재등록한다.
     *
     * @param scheduleId   동기화할 일정 UUID
     * @param symptomNames 새 증상명 목록 (null이면 삭제만 수행)
     */
    @Transactional
    public void syncScheduleSymptoms(UUID scheduleId, List<String> symptomNames) {
        scheduleSymptomRepository.deleteAllByScheduleId(scheduleId);
        if (symptomNames == null) return;
        for (String name : symptomNames) {
            SymptomMaster symptom = getOrCreateSymptom(name);
            scheduleSymptomRepository.save(ScheduleSymptom.builder()
                    .scheduleId(scheduleId).symptomId(symptom.getId())
                    .build());
        }
    }

    /**
     * [목적] 특정 진료 기록의 증상 연결을 모두 삭제한다.
     *
     * @param careRecordId 삭제할 진료 기록 UUID
     */
    @Transactional
    public void deleteCareRecordSymptoms(UUID careRecordId) {
        careRecordSymptomRepository.deleteAllByCareRecordId(careRecordId);
    }

    /**
     * [목적] 특정 일정의 증상 연결을 모두 삭제한다.
     *
     * @param scheduleId 삭제할 일정 UUID
     */
    @Transactional
    public void deleteScheduleSymptoms(UUID scheduleId) {
        scheduleSymptomRepository.deleteAllByScheduleId(scheduleId);
    }

    /**
     * [목적] 특정 진료 기록에 연결된 증상명 목록을 반환한다.
     *
     * @param careRecordId 조회할 진료 기록 UUID
     * @return 증상명 문자열 목록
     */
    @Transactional(readOnly = true)
    public List<String> getSymptomTagsByCareRecord(UUID careRecordId) {
        return careRecordSymptomRepository.findAllByCareRecordId(careRecordId).stream()
                .map(cs -> symptomMasterRepository.findById(cs.getSymptomId())
                        .map(SymptomMaster::getName).orElse(null))
                .filter(n -> n != null)
                .toList();
    }

    /**
     * [목적] 특정 일정에 연결된 증상명 목록을 반환한다.
     *
     * @param scheduleId 조회할 일정 UUID
     * @return 증상명 문자열 목록
     */
    @Transactional(readOnly = true)
    public List<String> getSymptomTagsBySchedule(UUID scheduleId) {
        return scheduleSymptomRepository.findAllByScheduleId(scheduleId).stream()
                .map(ss -> symptomMasterRepository.findById(ss.getSymptomId())
                        .map(SymptomMaster::getName).orElse(null))
                .filter(n -> n != null)
                .toList();
    }

    /**
     * [목적] 증상 스냅의 증상 태그를 동기화한다.
     * [설명] 기존 증상 연결을 모두 삭제한 후 새 목록으로 재등록한다.
     *
     * @param symptomSnapId 동기화할 증상 스냅 UUID
     * @param symptomNames  새 증상명 목록 (null이면 삭제만 수행)
     */
    @Transactional
    public void syncSymptomSnapSymptoms(UUID symptomSnapId, List<String> symptomNames) {
        symptomSnapSymptomRepository.deleteAllBySymptomSnapId(symptomSnapId);
        if (symptomNames == null) return;
        for (String name : symptomNames) {
            SymptomMaster symptom = getOrCreateSymptom(name);
            symptomSnapSymptomRepository.save(SymptomSnapSymptom.builder()
                    .symptomSnapId(symptomSnapId).symptomId(symptom.getId())
                    .build());
        }
    }

    /**
     * [목적] 특정 증상 스냅의 증상 연결을 모두 삭제한다.
     *
     * @param symptomSnapId 삭제할 증상 스냅 UUID
     */
    @Transactional
    public void deleteSymptomSnapSymptoms(UUID symptomSnapId) {
        symptomSnapSymptomRepository.deleteAllBySymptomSnapId(symptomSnapId);
    }

    /**
     * [목적] 특정 증상 스냅에 연결된 증상명 목록을 반환한다.
     *
     * @param symptomSnapId 조회할 증상 스냅 UUID
     * @return 증상명 문자열 목록
     */
    @Transactional(readOnly = true)
    public List<String> getSymptomTagsBySymptomSnap(UUID symptomSnapId) {
        return symptomSnapSymptomRepository.findAllBySymptomSnapId(symptomSnapId).stream()
                .map(ss -> symptomMasterRepository.findById(ss.getSymptomId())
                        .map(SymptomMaster::getName).orElse(null))
                .filter(n -> n != null)
                .toList();
    }
}
