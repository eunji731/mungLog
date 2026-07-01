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

/**
 * 케어 기록 서비스.
 * 반려동물의 병원 방문, 투약, 미용, 예방접종, 건강검진, 지출 등 케어 기록 CRUD 비즈니스 로직을 담당하는 클래스.
 * 케어 유형에 따라 진료 상세(MedicalDetail) 또는 지출 상세(ExpenseDetail)를 함께 관리한다.
 * 주요 기능: 목록/상세 조회, 등록, 수정, 삭제, 지출 연동용 병원 기록 후보 조회
 */
@Service
@RequiredArgsConstructor
public class CareService {

    /** 최근 1년 이내 병원 기록을 지출 연동 후보로 제한하는 기준 연도 수 */
    private static final int MEDICAL_CANDIDATE_YEARS = 1;

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

    /**
     * [목적] 케어 기록 목록을 조회한다.
     * [설명] petId와 keyword 조합으로 4가지 경우를 처리한다.
     *        그룹이 없으면 빈 목록을 반환한다.
     *
     * @param userId  요청 사용자 UUID
     * @param petId   반려동물 UUID 필터 (없으면 null)
     * @param keyword 제목·메모 검색 키워드 (없으면 null)
     * @return 케어 기록 목록 응답 DTO 리스트
     */
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

    /**
     * [목적] 케어 기록 상세 정보를 조회한다.
     * [설명] 그룹 소속 여부를 검증하고, 진료 기록의 증상 태그와 첨부파일을 함께 반환한다.
     *        지출 기록이 연동 병원 기록을 참조하면 해당 기록 요약도 포함한다.
     *
     * @param recordId 조회할 케어 기록 UUID
     * @param userId   요청 사용자 UUID
     * @return 케어 기록 상세 응답 DTO
     * @throws IllegalArgumentException 케어 기록이 없거나 권한이 없는 경우
     */
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

    /**
     * [목적] 지출 기록 작성 시 연동할 병원 기록 후보 목록을 조회한다.
     * [설명] 최근 1년 이내 HOSPITAL 타입 케어 기록만 반환한다.
     *
     * @param userId 요청 사용자 UUID
     * @param petId  반려동물 UUID
     * @return 병원 기록 목록 응답 DTO 리스트
     */
    @Transactional(readOnly = true)
    public List<CareRecordListResponse> getMedicalCandidates(UUID userId, UUID petId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        List<CareRecord> records = careRecordRepository.findMedicalCandidates(
                groupId, petId, CareRecordType.HOSPITAL, LocalDate.now().minusYears(MEDICAL_CANDIDATE_YEARS));
        return records.stream()
                .map(r -> CareRecordListResponse.from(r, 0))
                .toList();
    }

    /**
     * [목적] 새 케어 기록을 등록한다.
     * [설명] 케어 기록을 저장한 후, 요청 DTO에 따라 진료 상세 또는 지출 상세를 추가로 저장한다.
     *        증상 태그가 있으면 SymptomService를 통해 동기화한다.
     *
     * @param userId  요청 사용자 UUID
     * @param request 케어 기록 등록 요청 DTO
     * @return 등록된 케어 기록 상세 응답 DTO
     * @throws IllegalArgumentException 사용자 또는 반려동물을 찾을 수 없는 경우
     */
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

    /**
     * [목적] 기존 케어 기록을 수정한다.
     * [설명] 기본 정보, 진료 상세, 지출 상세, 증상 태그를 모두 갱신한다.
     *
     * @param recordId 수정할 케어 기록 UUID
     * @param userId   요청 사용자 UUID
     * @param request  수정 요청 DTO
     * @return 수정된 케어 기록 상세 응답 DTO
     * @throws IllegalArgumentException 케어 기록 또는 반려동물을 찾을 수 없는 경우
     */
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

    /**
     * [목적] 케어 기록을 삭제한다.
     * [설명] 연결된 증상 스냅 연결 해제 → 증상 태그 삭제 → 첨부파일 삭제 → 케어 기록 삭제 순서로 처리한다.
     *
     * @param recordId 삭제할 케어 기록 UUID
     * @param userId   요청 사용자 UUID
     * @throws IllegalArgumentException 케어 기록이 없거나 권한이 없는 경우
     */
    @Transactional
    public void deleteRecord(UUID recordId, UUID userId) {
        CareRecord record = findByIdAndGroupId(recordId, userId);
        symptomSnapService.unlinkAllByRecord(recordId);
        symptomService.deleteCareRecordSymptoms(recordId);
        attachedFileService.deleteAllByParent(ParentDomainType.CARE, recordId);
        careRecordRepository.delete(record);
    }

    /**
     * [목적] 요청 DTO에 따라 진료 상세를 저장하거나 수정한다.
     * [설명] 이미 존재하면 update() 호출, 없으면 새로 저장한다.
     *
     * @param record  연결할 케어 기록 엔티티
     * @param request 케어 기록 요청 DTO
     */
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

    /**
     * [목적] 요청 DTO에 따라 지출 상세를 저장하거나 수정한다.
     * [설명] 이미 존재하면 update() 호출, 없으면 새로 저장한다.
     *
     * @param record  연결할 케어 기록 엔티티
     * @param request 케어 기록 요청 DTO
     */
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

    /**
     * [목적] 예방접종 종류 ID로 VaccinationType 엔티티를 조회한다.
     *
     * @param vaccinationTypeId 예방접종 종류 ID (null이면 null 반환)
     * @return VaccinationType 엔티티 또는 null
     * @throws IllegalArgumentException 해당 ID의 예방접종 종류가 없는 경우
     */
    private VaccinationType resolveVaccinationType(Long vaccinationTypeId) {
        if (vaccinationTypeId == null) return null;
        return vaccinationTypeRepository.findById(vaccinationTypeId)
                .orElseThrow(() -> new IllegalArgumentException("접종종류를 찾을 수 없습니다: " + vaccinationTypeId));
    }

    /**
     * [목적] 케어 기록 ID와 사용자 그룹 ID로 케어 기록을 조회한다 (권한 검증 포함).
     *
     * @param recordId 케어 기록 UUID
     * @param userId   요청 사용자 UUID
     * @return 케어 기록 엔티티
     * @throws IllegalArgumentException 케어 기록이 없거나 그룹에 속하지 않는 경우
     */
    private CareRecord findByIdAndGroupId(UUID recordId, UUID userId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        return careRecordRepository.findByIdAndGroupId(recordId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("케어 기록을 찾을 수 없습니다."));
    }
}
