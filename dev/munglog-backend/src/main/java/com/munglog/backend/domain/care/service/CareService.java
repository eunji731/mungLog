package com.munglog.backend.domain.care.service;

import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.common.file.service.AttachedFileService;
import com.munglog.backend.domain.care.domain.*;
import com.munglog.backend.domain.care.dto.CareRecordCreateRequest;
import com.munglog.backend.domain.care.dto.CareRecordDetailResponse;
import com.munglog.backend.domain.care.dto.CareRecordListResponse;
import com.munglog.backend.domain.care.repository.CareRecordRepository;
import com.munglog.backend.domain.care.repository.ExpenseDetailRepository;
import com.munglog.backend.domain.care.repository.MedicalDetailRepository;
import com.munglog.backend.domain.family.service.FamilyGroupService;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import com.munglog.backend.domain.pet.domain.Pet;
import com.munglog.backend.domain.pet.repository.PetRepository;
import com.munglog.backend.domain.symptom.service.SymptomService;
import com.munglog.backend.domain.symptomsnap.service.SymptomSnapService;
import com.munglog.backend.domain.vaccination.domain.VaccinationType;
import com.munglog.backend.domain.vaccination.repository.VaccinationTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CareService {

    private final CareRecordRepository careRecordRepository;
    private final MedicalDetailRepository medicalDetailRepository;
    private final ExpenseDetailRepository expenseDetailRepository;
    private final MemberRepository memberRepository;
    private final PetRepository petRepository;
    private final FamilyGroupService familyGroupService;
    private final AttachedFileService attachedFileService;
    private final SymptomService symptomService;
    private final SymptomSnapService symptomSnapService;
    private final VaccinationTypeRepository vaccinationTypeRepository;

    @Transactional(readOnly = true)
    public List<CareRecordListResponse> getRecords(UUID userId, UUID petId, String keyword) {
        UUID groupId = familyGroupService.findGroupIdByUserId(userId).orElse(null);
        if (groupId == null) return List.of();
        String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        List<CareRecord> records;
        if (kw != null && petId != null) {
            records = careRecordRepository.findByGroupIdAndPetIdAndKeyword(groupId, petId, kw);
        } else if (kw != null) {
            records = careRecordRepository.findByGroupIdAndKeyword(groupId, kw);
        } else if (petId != null) {
            records = careRecordRepository.findByGroupIdAndPetId(groupId, petId);
        } else {
            records = careRecordRepository.findByGroupId(groupId);
        }
        return records.stream()
                .map(r -> CareRecordListResponse.from(r,
                        attachedFileService.getFiles(ParentDomainType.CARE, r.getId()).size()))
                .toList();
    }

    @Transactional(readOnly = true)
    public CareRecordDetailResponse getRecord(UUID recordId, UUID userId) {
        CareRecord record = findByIdAndGroupId(recordId, userId);
        List<String> symptomTags = symptomService.getSymptomTagsByCareRecord(recordId);
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.CARE, recordId);

        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        CareRecord relatedMedicalRecord = null;
        if (record.getExpenseDetail() != null && record.getExpenseDetail().getRelatedMedicalRecordId() != null) {
            relatedMedicalRecord = careRecordRepository
                    .findByIdAndGroupId(record.getExpenseDetail().getRelatedMedicalRecordId(), groupId)
                    .orElse(null);
        }

        return CareRecordDetailResponse.from(record, symptomTags, files, relatedMedicalRecord);
    }

    @Transactional(readOnly = true)
    public List<CareRecordListResponse> getMedicalCandidates(UUID userId, UUID petId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        List<CareRecord> records = careRecordRepository.findMedicalCandidates(
                groupId, petId, CareRecordType.HOSPITAL, LocalDate.now().minusYears(1));
        return records.stream()
                .map(r -> CareRecordListResponse.from(r, 0))
                .toList();
    }

    @Transactional
    public CareRecordDetailResponse createRecord(UUID userId, CareRecordCreateRequest request) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        Pet pet = petRepository.findByIdAndGroupId(request.getPetId(), groupId)
                .orElseThrow(() -> new IllegalArgumentException("반려동물을 찾을 수 없습니다."));

        VaccinationType vaccinationType = resolveVaccinationType(request.getVaccinationTypeId());

        CareRecord record = careRecordRepository.save(CareRecord.builder()
                .pet(pet).user(member)
                .recordType(CareRecordType.valueOf(request.getRecordType()))
                .recordDate(request.getRecordDate())
                .title(request.getTitle()).note(request.getNote())
                .sourceScheduleId(request.getSourceScheduleId())
                .vaccinationType(vaccinationType)
                .build());

        saveMedicalDetail(record, request);
        saveExpenseDetail(record, request);

        if (request.getMedicalDetail() != null && request.getMedicalDetail().getSymptomTags() != null) {
            symptomService.syncCareRecordSymptoms(record.getId(), pet.getId(),
                    request.getMedicalDetail().getSymptomTags(), null);
        }

        List<String> symptomTags = symptomService.getSymptomTagsByCareRecord(record.getId());
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.CARE, record.getId());
        return CareRecordDetailResponse.from(record, symptomTags, files);
    }

    @Transactional
    public CareRecordDetailResponse updateRecord(UUID recordId, UUID userId, CareRecordCreateRequest request) {
        CareRecord record = findByIdAndGroupId(recordId, userId);
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        Pet pet = petRepository.findByIdAndGroupId(request.getPetId(), groupId)
                .orElseThrow(() -> new IllegalArgumentException("반려동물을 찾을 수 없습니다."));

        VaccinationType vaccinationType = resolveVaccinationType(request.getVaccinationTypeId());
        record.update(pet, CareRecordType.valueOf(request.getRecordType()), request.getRecordDate(),
                request.getTitle(), request.getNote(), vaccinationType);

        saveMedicalDetail(record, request);
        saveExpenseDetail(record, request);

        if (request.getMedicalDetail() != null) {
            symptomService.syncCareRecordSymptoms(record.getId(), pet.getId(),
                    request.getMedicalDetail().getSymptomTags(), null);
        }

        List<String> symptomTags = symptomService.getSymptomTagsByCareRecord(record.getId());
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.CARE, record.getId());
        return CareRecordDetailResponse.from(record, symptomTags, files);
    }

    @Transactional
    public void deleteRecord(UUID recordId, UUID userId) {
        CareRecord record = findByIdAndGroupId(recordId, userId);
        symptomSnapService.unlinkAllByRecord(recordId);
        symptomService.deleteCareRecordSymptoms(recordId);
        attachedFileService.deleteAllByParent(ParentDomainType.CARE, recordId);
        careRecordRepository.delete(record);
    }

    private void saveMedicalDetail(CareRecord record, CareRecordCreateRequest request) {
        if (request.getMedicalDetail() == null) return;
        var req = request.getMedicalDetail();
        if (record.getMedicalDetail() != null) {
            record.getMedicalDetail().update(req.getClinicName(), req.getSymptoms(), req.getDiagnosis(),
                    req.getTreatment(), req.getMedicationStartDate(), req.getMedicationDays(), req.getAmount());
        } else {
            medicalDetailRepository.save(MedicalDetail.builder()
                    .careRecord(record).clinicName(req.getClinicName())
                    .symptoms(req.getSymptoms()).diagnosis(req.getDiagnosis())
                    .treatment(req.getTreatment()).medicationStartDate(req.getMedicationStartDate())
                    .medicationDays(req.getMedicationDays()).amount(req.getAmount())
                    .build());
        }
    }

    private void saveExpenseDetail(CareRecord record, CareRecordCreateRequest request) {
        if (request.getExpenseDetail() == null) return;
        var req = request.getExpenseDetail();
        if (record.getExpenseDetail() != null) {
            record.getExpenseDetail().update(req.getCategory(), req.getAmount(), req.getMemo(),
                    req.getRelatedMedicalRecordId());
        } else {
            expenseDetailRepository.save(ExpenseDetail.builder()
                    .careRecord(record).category(req.getCategory())
                    .amount(req.getAmount()).memo(req.getMemo())
                    .relatedMedicalRecordId(req.getRelatedMedicalRecordId())
                    .build());
        }
    }

    private VaccinationType resolveVaccinationType(Long vaccinationTypeId) {
        if (vaccinationTypeId == null) return null;
        return vaccinationTypeRepository.findById(vaccinationTypeId)
                .orElseThrow(() -> new IllegalArgumentException("접종종류를 찾을 수 없습니다: " + vaccinationTypeId));
    }

    private CareRecord findByIdAndGroupId(UUID recordId, UUID userId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        return careRecordRepository.findByIdAndGroupId(recordId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("케어 기록을 찾을 수 없습니다."));
    }
}
