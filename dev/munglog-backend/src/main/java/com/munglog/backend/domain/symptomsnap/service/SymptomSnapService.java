package com.munglog.backend.domain.symptomsnap.service;

import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.common.file.service.AttachedFileService;
import com.munglog.backend.domain.care.domain.CareRecord;
import com.munglog.backend.domain.care.repository.CareRecordRepository;
import com.munglog.backend.domain.family.service.FamilyGroupService;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import com.munglog.backend.domain.pet.domain.Pet;
import com.munglog.backend.domain.pet.repository.PetRepository;
import com.munglog.backend.domain.schedule.domain.Schedule;
import com.munglog.backend.domain.schedule.repository.ScheduleRepository;
import com.munglog.backend.domain.symptom.service.SymptomService;
import com.munglog.backend.domain.symptomsnap.domain.SymptomSnap;
import com.munglog.backend.domain.symptomsnap.dto.SymptomSnapRequest;
import com.munglog.backend.domain.symptomsnap.dto.SymptomSnapResponse;
import com.munglog.backend.domain.symptomsnap.repository.SymptomSnapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 증상 스냅 서비스.
 * 반려동물 증상 스냅 기록의 CRUD 및 진료 기록·일정 연동 비즈니스 로직을 담당하는 클래스.
 * 주요 기능: 목록 조회, 등록/수정/삭제, 진료 기록 연동/해제, 일정 연동/해제
 */
@Service
@RequiredArgsConstructor
public class SymptomSnapService {

    private final SymptomSnapRepository symptomSnapRepository;
    private final MemberRepository memberRepository;
    private final PetRepository petRepository;
    private final FamilyGroupService familyGroupService;
    private final CareRecordRepository careRecordRepository;
    private final ScheduleRepository scheduleRepository;
    private final AttachedFileService attachedFileService;
    private final SymptomService symptomService;

    /**
     * [목적] 그룹 내 증상 스냅 목록을 필터 조건으로 조회한다.
     * [설명] 사용자의 그룹 ID를 기준으로 반려동물·날짜 범위 필터를 적용하여 조회한다.
     *        그룹이 없으면 빈 목록을 반환한다.
     *
     * @param userId    요청 사용자 UUID
     * @param petId     반려동물 UUID 필터 (null이면 전체)
     * @param startDate 조회 시작일 (null이면 제한 없음)
     * @param endDate   조회 종료일 (null이면 제한 없음)
     * @return 증상 스냅 응답 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<SymptomSnapResponse> getSnaps(UUID userId, UUID petId, LocalDate startDate, LocalDate endDate) {
        return familyGroupService.findGroupIdByUserId(userId)
                .map(groupId -> symptomSnapRepository.searchByGroup(groupId, petId, startDate, endDate).stream()
                        .map(this::toResponse)
                        .toList())
                .orElse(List.of());
    }

    /**
     * [목적] 새 증상 스냅을 등록한다.
     * [설명] 사용자·반려동물 유효성을 검증한 후 스냅을 저장하고,
     *        증상 태그 동기화 및 이미지 저장을 수행한다.
     *
     * @param userId       등록 요청 사용자 UUID
     * @param request      증상 스냅 요청 DTO
     * @param symptomImage 증상 사진 파일 (null이면 저장 생략)
     * @return 등록된 증상 스냅 응답 DTO
     * @throws IllegalArgumentException 사용자 또는 반려동물을 찾을 수 없을 경우
     */
    @Transactional
    public SymptomSnapResponse createSnap(UUID userId, SymptomSnapRequest request, MultipartFile symptomImage) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        Pet pet = petRepository.findByIdAndGroupId(request.getPetId(), groupId)
                .orElseThrow(() -> new IllegalArgumentException("반려동물을 찾을 수 없습니다."));

        SymptomSnap snap = symptomSnapRepository.save(SymptomSnap.builder()
                .pet(pet).user(member)
                .date(request.getDate()).time(request.getTime())
                .memo(request.getMemo())
                .build());

        symptomService.syncSymptomSnapSymptoms(snap.getId(), request.getSymptomTags());

        if (symptomImage != null && !symptomImage.isEmpty()) {
            attachedFileService.saveAll(ParentDomainType.SYMPTOM_SNAP, snap.getId(), List.of(symptomImage));
        }

        return toResponse(snap);
    }

    /**
     * [목적] 기존 증상 스냅을 수정한다.
     * [설명] 그룹 소속 여부를 검증 후 날짜·시각·메모와 증상 태그를 갱신한다.
     *        새 이미지가 있으면 기존 이미지를 대체한다.
     *
     * @param snapId       수정할 스냅 UUID
     * @param userId       요청 사용자 UUID
     * @param request      수정 요청 DTO
     * @param symptomImage 새 증상 사진 파일 (null이면 기존 유지)
     * @return 수정된 증상 스냅 응답 DTO
     * @throws IllegalArgumentException 스냅이 존재하지 않거나 그룹 접근 권한이 없을 경우
     */
    @Transactional
    public SymptomSnapResponse updateSnap(UUID snapId, UUID userId, SymptomSnapRequest request, MultipartFile symptomImage) {
        SymptomSnap snap = findByIdAndGroupId(snapId, userId);

        snap.update(request.getDate(), request.getTime(), request.getMemo());
        symptomService.syncSymptomSnapSymptoms(snap.getId(), request.getSymptomTags());

        if (symptomImage != null && !symptomImage.isEmpty()) {
            attachedFileService.replaceSingle(ParentDomainType.SYMPTOM_SNAP, snap.getId(), symptomImage);
        }

        return toResponse(snap);
    }

    /**
     * [목적] 증상 스냅을 삭제한다.
     * [설명] 연결된 증상 태그와 첨부 이미지를 먼저 삭제한 후 스냅을 삭제한다.
     *
     * @param snapId 삭제할 스냅 UUID
     * @param userId 요청 사용자 UUID
     * @throws IllegalArgumentException 스냅이 존재하지 않거나 그룹 접근 권한이 없을 경우
     */
    @Transactional
    public void deleteSnap(UUID snapId, UUID userId) {
        SymptomSnap snap = findByIdAndGroupId(snapId, userId);
        symptomService.deleteSymptomSnapSymptoms(snapId);
        attachedFileService.deleteAllByParent(ParentDomainType.SYMPTOM_SNAP, snapId);
        symptomSnapRepository.delete(snap);
    }

    /**
     * [목적] 증상 스냅을 진료 기록과 연동한다.
     * [설명] 진료 기록의 그룹 소속 여부를 검증한 후 스냅에 연동하고 상태를 RESOLVED로 변경한다.
     *
     * @param snapId           연동할 스냅 UUID
     * @param userId           요청 사용자 UUID
     * @param resolvedRecordId 연동할 진료 기록 UUID
     * @return 업데이트된 증상 스냅 응답 DTO
     * @throws IllegalArgumentException 스냅 또는 진료 기록을 찾을 수 없을 경우
     */
    @Transactional
    public SymptomSnapResponse linkRecord(UUID snapId, UUID userId, UUID resolvedRecordId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        SymptomSnap snap = findByIdAndGroupId(snapId, userId);
        careRecordRepository.findByIdAndGroupId(resolvedRecordId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("케어 기록을 찾을 수 없습니다."));
        snap.link(resolvedRecordId);
        return toResponse(snap);
    }

    /**
     * [목적] 증상 스냅의 진료 기록 연동을 해제한다.
     * [설명] 연동 해제 시 상태가 MONITORING으로 돌아간다.
     *
     * @param snapId 연동 해제할 스냅 UUID
     * @param userId 요청 사용자 UUID
     * @return 업데이트된 증상 스냅 응답 DTO
     */
    @Transactional
    public SymptomSnapResponse unlinkRecord(UUID snapId, UUID userId) {
        SymptomSnap snap = findByIdAndGroupId(snapId, userId);
        snap.unlink();
        return toResponse(snap);
    }

    /**
     * [목적] 증상 스냅을 일정과 연동한다.
     *
     * @param snapId           연동할 스냅 UUID
     * @param userId           요청 사용자 UUID
     * @param linkedScheduleId 연동할 일정 UUID
     * @return 업데이트된 증상 스냅 응답 DTO
     * @throws IllegalArgumentException 스냅 또는 일정을 찾을 수 없을 경우
     */
    @Transactional
    public SymptomSnapResponse linkSchedule(UUID snapId, UUID userId, UUID linkedScheduleId) {
        SymptomSnap snap = findByIdAndGroupId(snapId, userId);
        scheduleRepository.findById(linkedScheduleId)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다."));
        snap.linkSchedule(linkedScheduleId);
        return toResponse(snap);
    }

    /**
     * [목적] 증상 스냅의 일정 연동을 해제한다.
     *
     * @param snapId 일정 연동 해제할 스냅 UUID
     * @param userId 요청 사용자 UUID
     * @return 업데이트된 증상 스냅 응답 DTO
     */
    @Transactional
    public SymptomSnapResponse unlinkSchedule(UUID snapId, UUID userId) {
        SymptomSnap snap = findByIdAndGroupId(snapId, userId);
        snap.unlinkSchedule();
        return toResponse(snap);
    }

    /**
     * [목적] 특정 일정과 연동된 모든 스냅의 일정 연동을 해제한다.
     * [설명] 일정 삭제 시 연동된 스냅들을 정리할 때 호출한다.
     *
     * @param scheduleId 연동 해제할 일정 UUID
     */
    @Transactional
    public void unlinkAllBySchedule(UUID scheduleId) {
        symptomSnapRepository.findByLinkedScheduleId(scheduleId)
                .forEach(SymptomSnap::unlinkSchedule);
    }

    /**
     * [목적] 특정 진료 기록과 연동된 모든 스냅의 진료 기록 연동을 해제한다.
     * [설명] 진료 기록 삭제 시 연동된 스냅들을 정리할 때 호출한다.
     *
     * @param recordId 연동 해제할 진료 기록 UUID
     */
    @Transactional
    public void unlinkAllByRecord(UUID recordId) {
        symptomSnapRepository.findByResolvedRecordId(recordId)
                .forEach(SymptomSnap::unlink);
    }

    /**
     * [목적] SymptomSnap 엔티티를 응답 DTO로 변환한다.
     * [설명] 증상 태그, 사진 URL, 연동된 진료 기록 제목, 일정 제목을 함께 조회하여 구성한다.
     *
     * @param snap 변환할 증상 스냅 엔티티
     * @return 증상 스냅 응답 DTO
     */
    private SymptomSnapResponse toResponse(SymptomSnap snap) {
        List<String> symptomTags = symptomService.getSymptomTagsBySymptomSnap(snap.getId());
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.SYMPTOM_SNAP, snap.getId());
        String photoUrl = files.isEmpty() ? null : files.get(0).getFileUrl();
        String resolvedRecordTitle = null;
        if (snap.getResolvedRecordId() != null) {
            resolvedRecordTitle = careRecordRepository.findById(snap.getResolvedRecordId())
                    .map(CareRecord::getTitle)
                    .orElse(null);
        }
        String linkedScheduleTitle = null;
        if (snap.getLinkedScheduleId() != null) {
            linkedScheduleTitle = scheduleRepository.findById(snap.getLinkedScheduleId())
                    .map(Schedule::getTitle)
                    .orElse(null);
        }
        return SymptomSnapResponse.from(snap, symptomTags, photoUrl, resolvedRecordTitle, linkedScheduleTitle);
    }

    /**
     * [목적] 스냅 ID와 사용자 그룹 ID로 증상 스냅을 조회한다.
     * [설명] 타 그룹의 스냅에 접근하지 못하도록 그룹 소속 여부를 함께 검증한다.
     *
     * @param snapId 조회할 스냅 UUID
     * @param userId 요청 사용자 UUID
     * @return 증상 스냅 엔티티
     * @throws IllegalArgumentException 스냅이 존재하지 않거나 그룹 접근 권한이 없을 경우
     */
    private SymptomSnap findByIdAndGroupId(UUID snapId, UUID userId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        return symptomSnapRepository.findByIdAndGroupId(snapId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("증상 스냅을 찾을 수 없습니다."));
    }
}
