package com.munglog.backend.domain.schedule.service;

import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.common.file.service.AttachedFileService;
import com.munglog.backend.domain.care.domain.CareRecord;
import com.munglog.backend.domain.care.domain.CareRecordType;
import com.munglog.backend.domain.care.domain.MedicalDetail;
import com.munglog.backend.domain.care.repository.CareRecordRepository;
import com.munglog.backend.domain.care.repository.MedicalDetailRepository;
import com.munglog.backend.domain.inventory.domain.InventoryItem;
import com.munglog.backend.domain.inventory.repository.InventoryItemRepository;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import com.munglog.backend.domain.pet.domain.Pet;
import com.munglog.backend.domain.pet.repository.PetRepository;
import com.munglog.backend.domain.schedule.domain.Schedule;
import com.munglog.backend.domain.schedule.domain.ScheduleType;
import com.munglog.backend.domain.schedule.dto.ScheduleRequest;
import com.munglog.backend.domain.schedule.dto.ScheduleResponse;
import com.munglog.backend.domain.schedule.dto.ScheduleStreakResponse;
import com.munglog.backend.domain.schedule.repository.ScheduleRepository;
import com.munglog.backend.domain.symptom.service.SymptomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private final InventoryItemRepository inventoryItemRepository;

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
        InventoryItem linkedItem = resolveInventoryItem(request.getInventoryItemId(), userId);

        Schedule schedule = scheduleRepository.save(Schedule.builder()
                .pet(pet).user(member)
                .scheduleType(ScheduleType.valueOf(request.getScheduleType()))
                .scheduleDate(request.getScheduleDate())
                .title(request.getTitle()).memo(request.getMemo())
                .location(request.getLocation())
                .linkedInventoryItem(linkedItem)
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
        InventoryItem linkedItem = resolveInventoryItem(request.getInventoryItemId(), userId);

        schedule.update(pet, ScheduleType.valueOf(request.getScheduleType()), request.getScheduleDate(),
                request.getTitle(), request.getMemo(), request.getLocation(), linkedItem);

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

        InventoryItem linkedItem = schedule.getLinkedInventoryItem();
        if (linkedItem != null) {
            linkedItem.adjustStock(Boolean.TRUE.equals(schedule.getIsCompleted()) ? -1 : 1);
            inventoryItemRepository.save(linkedItem);
        }

        return toResponse(schedule);
    }

    @Transactional
    public UUID convertToCareRecord(UUID scheduleId, UUID userId) {
        Schedule schedule = findByIdAndUserId(scheduleId, userId);
        careRecordRepository.findBySourceScheduleId(scheduleId).ifPresent(existing -> {
            throw new IllegalArgumentException("이미 케어기록으로 전환된 일정입니다.");
        });
        if (!Boolean.TRUE.equals(schedule.getIsCompleted())) {
            schedule.toggleCompletion();
        }

        CareRecord careRecord = careRecordRepository.save(CareRecord.builder()
                .pet(schedule.getPet()).user(schedule.getUser())
                .recordType(CareRecordType.HOSPITAL)
                .recordDate(schedule.getScheduleDate() != null
                        ? schedule.getScheduleDate().toLocalDate() : null)
                .title(schedule.getTitle()).note(schedule.getMemo())
                .sourceScheduleId(schedule.getId())
                .build());

        medicalDetailRepository.save(MedicalDetail.builder()
                .careRecord(careRecord).build());

        return careRecord.getId();
    }

    @Transactional(readOnly = true)
    public List<ScheduleStreakResponse> getScheduleStreaks(UUID userId, UUID petId) {
        List<Schedule> schedules = petId != null
                ? scheduleRepository.findByUserIdAndPetId(userId, petId)
                : scheduleRepository.findByUserId(userId);

        return schedules.stream()
                .filter(s -> s.getTitle() != null && !s.getTitle().isBlank())
                .collect(Collectors.groupingBy(s -> s.getPet().getId() + "_" + s.getTitle().trim()))
                .values().stream()
                .filter(group -> group.size() >= 2)
                .map(this::toStreakResponse)
                .sorted(Comparator.comparingInt(ScheduleStreakResponse::streakCount).reversed())
                .toList();
    }

    private ScheduleStreakResponse toStreakResponse(List<Schedule> group) {
        List<Schedule> sorted = group.stream()
                .sorted(Comparator.comparing(Schedule::getScheduleDate))
                .toList();

        int streak = 0;
        for (int i = sorted.size() - 1; i >= 0; i--) {
            if (Boolean.TRUE.equals(sorted.get(i).getIsCompleted())) {
                streak++;
            } else {
                break;
            }
        }

        List<Long> intervals = new java.util.ArrayList<>();
        for (int i = 1; i < sorted.size(); i++) {
            var prev = sorted.get(i - 1).getScheduleDate();
            var curr = sorted.get(i).getScheduleDate();
            if (prev != null && curr != null) {
                intervals.add(ChronoUnit.DAYS.between(prev, curr));
            }
        }
        long avgIntervalDays = intervals.isEmpty()
                ? 30
                : Math.max(1, (long) intervals.stream().mapToLong(Long::longValue).average().orElse(30));

        Schedule last = sorted.get(sorted.size() - 1);
        var nextSuggestedDate = last.getScheduleDate() != null
                ? last.getScheduleDate().plusDays(avgIntervalDays)
                : null;

        List<ScheduleStreakResponse.Occurrence> recent = sorted.stream()
                .skip(Math.max(0, sorted.size() - 6))
                .map(s -> new ScheduleStreakResponse.Occurrence(s.getScheduleDate(), Boolean.TRUE.equals(s.getIsCompleted())))
                .toList();

        // 가장 최근에 연동된 재고 아이템을 기준으로 소진 예상일을 계산합니다.
        InventoryItem linkedItem = sorted.stream()
                .sorted(Comparator.comparing(Schedule::getScheduleDate).reversed())
                .map(Schedule::getLinkedInventoryItem)
                .filter(item -> item != null)
                .findFirst()
                .orElse(null);

        LocalDateTime stockDepletionDate = null;
        boolean lowStockWarning = false;
        if (linkedItem != null && last.getScheduleDate() != null) {
            int stock = linkedItem.getStock() != null ? linkedItem.getStock() : 0;
            stockDepletionDate = last.getScheduleDate().plusDays(avgIntervalDays * stock);
            lowStockWarning = stock <= 1 || stockDepletionDate.isBefore(LocalDateTime.now().plusDays(45));
        }

        return ScheduleStreakResponse.builder()
                .petId(last.getPet().getId())
                .petName(last.getPet().getName())
                .title(last.getTitle())
                .scheduleType(last.getScheduleType())
                .totalCount(sorted.size())
                .streakCount(streak)
                .lastScheduleDate(last.getScheduleDate())
                .lastCompleted(Boolean.TRUE.equals(last.getIsCompleted()))
                .nextSuggestedDate(nextSuggestedDate)
                .recentOccurrences(recent)
                .inventoryItemId(linkedItem != null ? linkedItem.getId() : null)
                .inventoryItemName(linkedItem != null ? linkedItem.getName() : null)
                .inventoryItemStock(linkedItem != null ? linkedItem.getStock() : null)
                .stockDepletionDate(stockDepletionDate)
                .lowStockWarning(lowStockWarning)
                .build();
    }

    private ScheduleResponse toResponse(Schedule schedule) {
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.SCHEDULE, schedule.getId());
        List<String> tags = symptomService.getSymptomTagsBySchedule(schedule.getId());
        UUID convertedCareRecordId = careRecordRepository.findBySourceScheduleId(schedule.getId())
                .map(CareRecord::getId)
                .orElse(null);
        return ScheduleResponse.of(schedule, files, tags, convertedCareRecordId);
    }

    private InventoryItem resolveInventoryItem(UUID inventoryItemId, UUID userId) {
        if (inventoryItemId == null) return null;
        return inventoryItemRepository.findByIdAndUserId(inventoryItemId, userId)
                .orElseThrow(() -> new IllegalArgumentException("재고 아이템을 찾을 수 없습니다."));
    }

    private Schedule findByIdAndUserId(UUID scheduleId, UUID userId) {
        return scheduleRepository.findByIdAndUser_Id(scheduleId, userId)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다."));
    }
}
