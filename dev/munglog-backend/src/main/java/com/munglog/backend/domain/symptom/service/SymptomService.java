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

@Service
@RequiredArgsConstructor
public class SymptomService {

    private final SymptomMasterRepository symptomMasterRepository;
    private final CareRecordSymptomRepository careRecordSymptomRepository;
    private final ScheduleSymptomRepository scheduleSymptomRepository;
    private final SymptomSnapSymptomRepository symptomSnapSymptomRepository;

    @Transactional(readOnly = true)
    public List<SymptomResponse> searchSymptoms(String keyword) {
        return symptomMasterRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(SymptomResponse::from).toList();
    }

    // ─── Admin CRUD ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<SymptomResponse> getAllSymptoms() {
        return symptomMasterRepository.findAllByOrderByIsActiveDescNameAsc().stream()
                .map(SymptomResponse::from).toList();
    }

    @Transactional
    public SymptomResponse createSymptom(String name) {
        if (symptomMasterRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 증상입니다: " + name);
        }
        SymptomMaster symptom = symptomMasterRepository.save(SymptomMaster.builder().name(name).build());
        return SymptomResponse.from(symptom);
    }

    @Transactional
    public SymptomResponse updateSymptom(Long id, String name) {
        SymptomMaster symptom = symptomMasterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("증상을 찾을 수 없습니다."));
        symptom.updateName(name);
        return SymptomResponse.from(symptom);
    }

    @Transactional
    public void deactivateSymptom(Long id) {
        SymptomMaster symptom = symptomMasterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("증상을 찾을 수 없습니다."));
        symptom.deactivate();
    }

    @Transactional
    public void activateSymptom(Long id) {
        SymptomMaster symptom = symptomMasterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("증상을 찾을 수 없습니다."));
        symptom.activate();
    }

    @Transactional
    public void mergeSymptoms(Long sourceId, Long targetId) {
        SymptomMaster source = symptomMasterRepository.findById(sourceId)
                .orElseThrow(() -> new IllegalArgumentException("소스 증상을 찾을 수 없습니다."));
        if (!symptomMasterRepository.existsById(targetId)) {
            throw new IllegalArgumentException("대상 증상을 찾을 수 없습니다.");
        }
        // 관련 레코드 모두 target으로 이전
        careRecordSymptomRepository.updateSymptomId(sourceId, targetId);
        scheduleSymptomRepository.updateSymptomId(sourceId, targetId);
        symptomSnapSymptomRepository.updateSymptomId(sourceId, targetId);
        symptomMasterRepository.delete(source);
    }

    @Transactional
    public SymptomMaster getOrCreateSymptom(String name) {
        return symptomMasterRepository.findByName(name)
                .orElseGet(() -> symptomMasterRepository.save(SymptomMaster.builder().name(name).build()));
    }

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

    @Transactional
    public void deleteCareRecordSymptoms(UUID careRecordId) {
        careRecordSymptomRepository.deleteAllByCareRecordId(careRecordId);
    }

    @Transactional
    public void deleteScheduleSymptoms(UUID scheduleId) {
        scheduleSymptomRepository.deleteAllByScheduleId(scheduleId);
    }

    @Transactional(readOnly = true)
    public List<String> getSymptomTagsByCareRecord(UUID careRecordId) {
        return careRecordSymptomRepository.findAllByCareRecordId(careRecordId).stream()
                .map(cs -> symptomMasterRepository.findById(cs.getSymptomId())
                        .map(SymptomMaster::getName).orElse(null))
                .filter(n -> n != null)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> getSymptomTagsBySchedule(UUID scheduleId) {
        return scheduleSymptomRepository.findAllByScheduleId(scheduleId).stream()
                .map(ss -> symptomMasterRepository.findById(ss.getSymptomId())
                        .map(SymptomMaster::getName).orElse(null))
                .filter(n -> n != null)
                .toList();
    }

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

    @Transactional
    public void deleteSymptomSnapSymptoms(UUID symptomSnapId) {
        symptomSnapSymptomRepository.deleteAllBySymptomSnapId(symptomSnapId);
    }

    @Transactional(readOnly = true)
    public List<String> getSymptomTagsBySymptomSnap(UUID symptomSnapId) {
        return symptomSnapSymptomRepository.findAllBySymptomSnapId(symptomSnapId).stream()
                .map(ss -> symptomMasterRepository.findById(ss.getSymptomId())
                        .map(SymptomMaster::getName).orElse(null))
                .filter(n -> n != null)
                .toList();
    }
}
