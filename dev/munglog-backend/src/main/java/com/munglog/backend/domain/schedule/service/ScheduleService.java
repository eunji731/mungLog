package com.munglog.backend.domain.schedule.service;

import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.common.file.service.AttachedFileService;
import com.munglog.backend.domain.care.domain.CareRecord;
import com.munglog.backend.domain.care.domain.CareRecordType;
import com.munglog.backend.domain.care.domain.MedicalDetail;
import com.munglog.backend.domain.care.repository.CareRecordRepository;
import com.munglog.backend.domain.care.repository.MedicalDetailRepository;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import com.munglog.backend.domain.pet.domain.Pet;
import com.munglog.backend.domain.pet.repository.PetRepository;
import com.munglog.backend.domain.schedule.domain.Schedule;
import com.munglog.backend.domain.schedule.domain.ScheduleType;
import com.munglog.backend.domain.schedule.dto.ScheduleRequest;
import com.munglog.backend.domain.schedule.dto.ScheduleResponse;
import com.munglog.backend.domain.schedule.repository.ScheduleRepository;
import com.munglog.backend.domain.symptom.service.SymptomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final CareRecordRepository careRecordRepository;
    private final MedicalDetailRepository medicalDetailRepository;
    private final MemberRepository memberRepository;
    private final PetRepository petRepository;
    private final AttachedFileService attachedFileService;
    private final SymptomService symptomService;

    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedules(UUID userId, UUID petId) {
        List<Schedule> schedules = petId != null
                ? scheduleRepository.findByUserIdAndPetId(userId, petId)
                : scheduleRepository.findByUserId(userId);
        return schedules.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ScheduleResponse getSchedule(UUID scheduleId, UUID userId) {
        Schedule schedule = findByIdAndUserId(scheduleId, userId);
        return toResponse(schedule);
    }

    @Transactional
    public ScheduleResponse createSchedule(UUID userId, ScheduleRequest request) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Pet pet = petRepository.findByIdAndUserId(request.getPetId(), userId)
                .orElseThrow(() -> new IllegalArgumentException("반려동물을 찾을 수 없습니다."));

        Schedule schedule = scheduleRepository.save(Schedule.builder()
                .pet(pet).user(member)
                .scheduleType(ScheduleType.valueOf(request.getScheduleType()))
                .scheduleDate(request.getScheduleDate())
                .title(request.getTitle()).memo(request.getMemo())
                .location(request.getLocation())
                .build());

        if (request.getSymptomTags() != null && !request.getSymptomTags().isEmpty()) {
            symptomService.syncScheduleSymptoms(schedule.getId(), request.getSymptomTags());
        }

        return toResponse(schedule);
    }

    @Transactional
    public ScheduleResponse updateSchedule(UUID scheduleId, UUID userId, ScheduleRequest request) {
        Schedule schedule = findByIdAndUserId(scheduleId, userId);
        Pet pet = petRepository.findByIdAndUserId(request.getPetId(), userId)
                .orElseThrow(() -> new IllegalArgumentException("반려동물을 찾을 수 없습니다."));

        schedule.update(pet, ScheduleType.valueOf(request.getScheduleType()), request.getScheduleDate(),
                request.getTitle(), request.getMemo(), request.getLocation());

        if (request.getSymptomTags() != null) {
            symptomService.syncScheduleSymptoms(schedule.getId(), request.getSymptomTags());
        }

        return toResponse(schedule);
    }

    @Transactional
    public void deleteSchedule(UUID scheduleId, UUID userId) {
        Schedule schedule = findByIdAndUserId(scheduleId, userId);
        symptomService.deleteScheduleSymptoms(scheduleId);
        attachedFileService.deleteAllByParent(ParentDomainType.SCHEDULE, scheduleId);
        scheduleRepository.delete(schedule);
    }

    @Transactional
    public ScheduleResponse toggleCompletion(UUID scheduleId, UUID userId) {
        Schedule schedule = findByIdAndUserId(scheduleId, userId);
        schedule.toggleCompletion();
        scheduleRepository.save(schedule);
        return toResponse(schedule);
    }

    @Transactional
    public UUID convertToCareRecord(UUID scheduleId, UUID userId) {
        Schedule schedule = findByIdAndUserId(scheduleId, userId);
        if (!Boolean.TRUE.equals(schedule.getIsCompleted())) {
            schedule.toggleCompletion();
        }

        CareRecord careRecord = careRecordRepository.save(CareRecord.builder()
                .pet(schedule.getPet()).user(schedule.getUser())
                .recordType(CareRecordType.HOSPITAL)
                .recordDate(schedule.getScheduleDate() != null
                        ? schedule.getScheduleDate().toLocalDate() : null)
                .title(schedule.getTitle()).note(schedule.getMemo())
                .build());

        medicalDetailRepository.save(MedicalDetail.builder()
                .careRecord(careRecord).build());

        return careRecord.getId();
    }

    private ScheduleResponse toResponse(Schedule schedule) {
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.SCHEDULE, schedule.getId());
        List<String> tags = symptomService.getSymptomTagsBySchedule(schedule.getId());
        return ScheduleResponse.of(schedule, files, tags);
    }

    private Schedule findByIdAndUserId(UUID scheduleId, UUID userId) {
        return scheduleRepository.findByIdAndUser_Id(scheduleId, userId)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다."));
    }
}
