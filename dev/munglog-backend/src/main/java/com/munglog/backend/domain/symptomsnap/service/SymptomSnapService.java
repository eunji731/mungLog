package com.munglog.backend.domain.symptomsnap.service;

import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.common.file.service.AttachedFileService;
import com.munglog.backend.domain.care.domain.CareRecord;
import com.munglog.backend.domain.care.repository.CareRecordRepository;
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

@Service
@RequiredArgsConstructor
public class SymptomSnapService {

    private final SymptomSnapRepository symptomSnapRepository;
    private final MemberRepository memberRepository;
    private final PetRepository petRepository;
    private final CareRecordRepository careRecordRepository;
    private final ScheduleRepository scheduleRepository;
    private final AttachedFileService attachedFileService;
    private final SymptomService symptomService;

    @Transactional(readOnly = true)
    public List<SymptomSnapResponse> getSnaps(UUID userId, UUID petId, LocalDate startDate, LocalDate endDate) {
        return symptomSnapRepository.search(userId, petId, startDate, endDate).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SymptomSnapResponse createSnap(UUID userId, SymptomSnapRequest request, MultipartFile symptomImage) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Pet pet = petRepository.findByIdAndUserId(request.getPetId(), userId)
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

    @Transactional
    public SymptomSnapResponse updateSnap(UUID snapId, UUID userId, SymptomSnapRequest request, MultipartFile symptomImage) {
        SymptomSnap snap = findByIdAndUserId(snapId, userId);

        snap.update(request.getDate(), request.getTime(), request.getMemo());
        symptomService.syncSymptomSnapSymptoms(snap.getId(), request.getSymptomTags());

        if (symptomImage != null && !symptomImage.isEmpty()) {
            attachedFileService.replaceSingle(ParentDomainType.SYMPTOM_SNAP, snap.getId(), symptomImage);
        }

        return toResponse(snap);
    }

    @Transactional
    public void deleteSnap(UUID snapId, UUID userId) {
        SymptomSnap snap = findByIdAndUserId(snapId, userId);
        symptomService.deleteSymptomSnapSymptoms(snapId);
        attachedFileService.deleteAllByParent(ParentDomainType.SYMPTOM_SNAP, snapId);
        symptomSnapRepository.delete(snap);
    }

    @Transactional
    public SymptomSnapResponse linkRecord(UUID snapId, UUID userId, UUID resolvedRecordId) {
        SymptomSnap snap = findByIdAndUserId(snapId, userId);
        careRecordRepository.findByIdAndUser_Id(resolvedRecordId, userId)
                .orElseThrow(() -> new IllegalArgumentException("케어 기록을 찾을 수 없습니다."));
        snap.link(resolvedRecordId);
        return toResponse(snap);
    }

    @Transactional
    public SymptomSnapResponse unlinkRecord(UUID snapId, UUID userId) {
        SymptomSnap snap = findByIdAndUserId(snapId, userId);
        snap.unlink();
        return toResponse(snap);
    }

    @Transactional
    public SymptomSnapResponse linkSchedule(UUID snapId, UUID userId, UUID linkedScheduleId) {
        SymptomSnap snap = findByIdAndUserId(snapId, userId);
        scheduleRepository.findById(linkedScheduleId)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다."));
        snap.linkSchedule(linkedScheduleId);
        return toResponse(snap);
    }

    @Transactional
    public SymptomSnapResponse unlinkSchedule(UUID snapId, UUID userId) {
        SymptomSnap snap = findByIdAndUserId(snapId, userId);
        snap.unlinkSchedule();
        return toResponse(snap);
    }

    @Transactional
    public void unlinkAllBySchedule(UUID scheduleId) {
        symptomSnapRepository.findByLinkedScheduleId(scheduleId)
                .forEach(SymptomSnap::unlinkSchedule);
    }

    @Transactional
    public void unlinkAllByRecord(UUID recordId) {
        symptomSnapRepository.findByResolvedRecordId(recordId)
                .forEach(SymptomSnap::unlink);
    }

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

    private SymptomSnap findByIdAndUserId(UUID snapId, UUID userId) {
        return symptomSnapRepository.findByIdAndUser_Id(snapId, userId)
                .orElseThrow(() -> new IllegalArgumentException("증상 스냅을 찾을 수 없습니다."));
    }
}
