package com.munglog.backend.domain.schedule.service;

import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.common.file.service.AttachedFileService;
import com.munglog.backend.domain.care.domain.CareRecord;
import com.munglog.backend.domain.care.domain.CareRecordType;
import com.munglog.backend.domain.care.domain.MedicalDetail;
import com.munglog.backend.domain.care.repository.CareRecordRepository;
import com.munglog.backend.domain.care.repository.MedicalDetailRepository;
import com.munglog.backend.domain.family.service.FamilyGroupService;
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
import com.munglog.backend.domain.symptomsnap.service.SymptomSnapService;
import com.munglog.backend.domain.vaccination.domain.VaccinationType;
import com.munglog.backend.domain.vaccination.repository.VaccinationTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 일정(Schedule) 서비스.
 * 반려동물 돌봄 일정 등록·조회·수정·삭제 및 케어기록 전환 비즈니스 로직을 처리하는 클래스.
 * 일정 완료 시 연결된 용품의 재고를 -1 조정하고, 취소 시 +1 복원한다.
 * 주요 기능: 일정 CRUD, 완료 토글, 케어기록 전환, 스트릭 조회
 */
@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final CareRecordRepository careRecordRepository;
    private final MedicalDetailRepository medicalDetailRepository;
    private final MemberRepository memberRepository;
    private final PetRepository petRepository;
    private final FamilyGroupService familyGroupService;
    private final AttachedFileService attachedFileService;
    private final SymptomService symptomService;
    private final SymptomSnapService symptomSnapService;
    private final InventoryItemRepository inventoryItemRepository;
    private final VaccinationTypeRepository vaccinationTypeRepository;

    /**
     * [목적] 현재 사용자 그룹의 일정 목록을 조회한다.
     * [설명] petId와 keyword 조합에 따라 4가지 쿼리 경로로 분기하며,
     *        그룹이 없으면 빈 목록을 반환한다.
     *
     * @param userId  요청 사용자 UUID
     * @param petId   특정 반려동물 필터 (없으면 null)
     * @param keyword 제목·메모 검색어 (없으면 null)
     * @return 일정 응답 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedules(UUID userId, UUID petId, String keyword) {
        UUID groupId = familyGroupService.findGroupIdByUserId(userId).orElse(null);
        if (groupId == null) return List.of();
        String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        List<Schedule> schedules;
        if (kw != null && petId != null) {
            schedules = scheduleRepository.findByGroupIdAndPetIdAndKeyword(groupId, petId, kw);
        } else if (kw != null) {
            schedules = scheduleRepository.findByGroupIdAndKeyword(groupId, kw);
        } else if (petId != null) {
            schedules = scheduleRepository.findByGroupIdAndPetId(groupId, petId);
        } else {
            schedules = scheduleRepository.findByGroupId(groupId);
        }
        return schedules.stream().map(this::toResponse).toList();
    }

    /**
     * [목적] 특정 일정의 상세 정보를 조회한다.
     *
     * @param scheduleId 조회할 일정 UUID
     * @param userId     요청 사용자 UUID
     * @return 일정 응답 DTO
     * @throws IllegalArgumentException 일정이 없거나 그룹 접근 권한이 없을 경우
     */
    @Transactional(readOnly = true)
    public ScheduleResponse getSchedule(UUID scheduleId, UUID userId) {
        Schedule schedule = findByIdAndGroupId(scheduleId, userId);
        return toResponse(schedule);
    }

    /**
     * [목적] 새 일정을 등록한다.
     * [설명] 반려동물과 사용자를 검증하고, 연결 용품·예방접종 종류가 있으면 함께 설정한다.
     *        증상 태그가 있으면 SymptomService를 통해 동기화한다.
     *
     * @param userId  등록 사용자 UUID
     * @param request 일정 정보 DTO
     * @return 등록된 일정 응답 DTO
     * @throws IllegalArgumentException 사용자·반려동물·용품·예방접종 종류를 찾을 수 없을 경우
     */
    @Transactional
    public ScheduleResponse createSchedule(UUID userId, ScheduleRequest request) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        Pet pet = petRepository.findByIdAndGroupId(request.getPetId(), groupId)
                .orElseThrow(() -> new IllegalArgumentException("반려동물을 찾을 수 없습니다."));
        InventoryItem linkedItem = resolveInventoryItem(request.getInventoryItemId(), groupId);
        VaccinationType vaccinationType = resolveVaccinationType(request.getVaccinationTypeId());

        Schedule schedule = scheduleRepository.save(Schedule.builder()
                .pet(pet).user(member)
                .scheduleType(ScheduleType.valueOf(request.getScheduleType()))
                .scheduleDate(request.getScheduleDate())
                .title(request.getTitle()).memo(request.getMemo())
                .location(request.getLocation())
                .linkedInventoryItem(linkedItem)
                .vaccinationType(vaccinationType)
                .build());

        if (request.getSymptomTags() != null && !request.getSymptomTags().isEmpty()) {
            symptomService.syncScheduleSymptoms(schedule.getId(), request.getSymptomTags());
        }

        return toResponse(schedule);
    }

    /**
     * [목적] 일정 정보를 수정한다.
     *
     * @param scheduleId 수정할 일정 UUID
     * @param userId     요청 사용자 UUID
     * @param request    수정할 일정 정보 DTO
     * @return 수정된 일정 응답 DTO
     * @throws IllegalArgumentException 일정·반려동물·용품·예방접종 종류를 찾을 수 없을 경우
     */
    @Transactional
    public ScheduleResponse updateSchedule(UUID scheduleId, UUID userId, ScheduleRequest request) {
        Schedule schedule = findByIdAndGroupId(scheduleId, userId);
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        Pet pet = petRepository.findByIdAndGroupId(request.getPetId(), groupId)
                .orElseThrow(() -> new IllegalArgumentException("반려동물을 찾을 수 없습니다."));
        InventoryItem linkedItem = resolveInventoryItem(request.getInventoryItemId(), groupId);
        VaccinationType vaccinationType = resolveVaccinationType(request.getVaccinationTypeId());

        schedule.update(pet, ScheduleType.valueOf(request.getScheduleType()), request.getScheduleDate(),
                request.getTitle(), request.getMemo(), request.getLocation(), linkedItem, vaccinationType);

        if (request.getSymptomTags() != null) {
            symptomService.syncScheduleSymptoms(schedule.getId(), request.getSymptomTags());
        }

        return toResponse(schedule);
    }

    /**
     * [목적] 일정을 삭제한다.
     * [설명] 연결된 증상 스냅·증상 태그·첨부파일을 모두 정리한 후 일정을 삭제한다.
     *
     * @param scheduleId 삭제할 일정 UUID
     * @param userId     요청 사용자 UUID
     * @throws IllegalArgumentException 일정이 없거나 그룹 접근 권한이 없을 경우
     */
    @Transactional
    public void deleteSchedule(UUID scheduleId, UUID userId) {
        Schedule schedule = findByIdAndGroupId(scheduleId, userId);
        symptomSnapService.unlinkAllBySchedule(scheduleId);
        symptomService.deleteScheduleSymptoms(scheduleId);
        attachedFileService.deleteAllByParent(ParentDomainType.SCHEDULE, scheduleId);
        scheduleRepository.delete(schedule);
    }

    /**
     * [목적] 일정의 완료 여부를 토글하고 연결 용품 재고를 조정한다.
     * [설명] 완료 → 미완료: 재고 +1 복원 / 미완료 → 완료: 재고 -1 차감.
     *
     * @param scheduleId 토글할 일정 UUID
     * @param userId     요청 사용자 UUID
     * @return 변경된 일정 응답 DTO
     */
    @Transactional
    public ScheduleResponse toggleCompletion(UUID scheduleId, UUID userId) {
        Schedule schedule = findByIdAndGroupId(scheduleId, userId);
        schedule.toggleCompletion();
        scheduleRepository.save(schedule);

        InventoryItem linkedItem = schedule.getLinkedInventoryItem();
        if (linkedItem != null) {
            linkedItem.adjustStock(Boolean.TRUE.equals(schedule.getIsCompleted()) ? -1 : 1);
            inventoryItemRepository.save(linkedItem);
        }

        return toResponse(schedule);
    }

    /**
     * [목적] 완료된 일정을 케어기록으로 전환한다.
     * [설명] 일정 유형이 VACCINATION이면 케어기록 타입을 VACCINATION으로,
     *        나머지는 HOSPITAL로 설정한다. 이미 전환된 일정은 예외를 발생시킨다.
     *
     * @param scheduleId 전환할 일정 UUID
     * @param userId     요청 사용자 UUID
     * @return 생성된 케어기록 UUID
     * @throws IllegalArgumentException 이미 전환된 일정이거나 일정이 없을 경우
     */
    @Transactional
    public UUID convertToCareRecord(UUID scheduleId, UUID userId) {
        Schedule schedule = findByIdAndGroupId(scheduleId, userId);
        careRecordRepository.findBySourceScheduleId(scheduleId).ifPresent(existing -> {
            throw new IllegalArgumentException("이미 케어기록으로 전환된 일정입니다.");
        });
        if (!Boolean.TRUE.equals(schedule.getIsCompleted())) {
            schedule.toggleCompletion();
        }

        CareRecordType careRecordType = schedule.getScheduleType() == ScheduleType.VACCINATION
                ? CareRecordType.VACCINATION : CareRecordType.HOSPITAL;

        CareRecord careRecord = careRecordRepository.save(CareRecord.builder()
                .pet(schedule.getPet()).user(schedule.getUser())
                .recordType(careRecordType)
                .recordDate(schedule.getScheduleDate() != null
                        ? schedule.getScheduleDate().toLocalDate() : null)
                .title(schedule.getTitle()).note(schedule.getMemo())
                .sourceScheduleId(schedule.getId())
                .vaccinationType(schedule.getVaccinationType())
                .build());

        medicalDetailRepository.save(MedicalDetail.builder()
                .careRecord(careRecord).build());

        return careRecord.getId();
    }

    /**
     * [목적] 동일 반려동물·제목 기준으로 반복된 일정의 스트릭 정보를 조회한다.
     * [설명] 2회 이상 반복된 그룹만 포함하며, streakCount 내림차순으로 정렬하여 반환한다.
     *
     * @param userId 요청 사용자 UUID
     * @param petId  특정 반려동물 필터 (없으면 null)
     * @return 스트릭 응답 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<ScheduleStreakResponse> getScheduleStreaks(UUID userId, UUID petId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        List<Schedule> schedules = petId != null
                ? scheduleRepository.findByGroupIdAndPetId(groupId, petId)
                : scheduleRepository.findByGroupId(groupId);

        return schedules.stream()
                .filter(s -> s.getTitle() != null && !s.getTitle().isBlank())
                .collect(Collectors.groupingBy(s -> s.getPet().getId() + "_" + s.getTitle().trim()))
                .values().stream()
                .filter(group -> group.size() >= 2)
                .map(this::toStreakResponse)
                .sorted(Comparator.comparingInt(ScheduleStreakResponse::streakCount).reversed())
                .toList();
    }

    /**
     * [목적] 동일 그룹의 일정 목록으로 스트릭 응답 DTO를 생성한다.
     * [설명] 날짜 오름차순으로 정렬 후 마지막부터 연속 완료 수를 계산한다.
     *        평균 간격으로 다음 예상일과 재고 소진일을 예측한다.
     *
     * @param group 동일 반려동물·제목의 일정 목록
     * @return 스트릭 응답 DTO
     */
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

    /**
     * [목적] 일정 엔티티를 응답 DTO로 변환한다.
     * [설명] 첨부파일·증상태그·전환된 케어기록 ID를 함께 조회하여 포함한다.
     *
     * @param schedule 일정 엔티티
     * @return 일정 응답 DTO
     */
    private ScheduleResponse toResponse(Schedule schedule) {
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.SCHEDULE, schedule.getId());
        List<String> tags = symptomService.getSymptomTagsBySchedule(schedule.getId());
        UUID convertedCareRecordId = careRecordRepository.findBySourceScheduleId(schedule.getId())
                .map(CareRecord::getId)
                .orElse(null);
        return ScheduleResponse.of(schedule, files, tags, convertedCareRecordId);
    }

    /**
     * [목적] 용품 ID가 있을 때 그룹 내 용품을 조회한다.
     *
     * @param inventoryItemId 용품 UUID (없으면 null)
     * @param groupId         가족 그룹 UUID
     * @return 용품 엔티티 또는 null
     * @throws IllegalArgumentException 용품을 찾을 수 없을 경우
     */
    private InventoryItem resolveInventoryItem(UUID inventoryItemId, UUID groupId) {
        if (inventoryItemId == null) return null;
        return inventoryItemRepository.findByIdAndGroupId(inventoryItemId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("재고 아이템을 찾을 수 없습니다."));
    }

    /**
     * [목적] 예방접종 종류 ID가 있을 때 예방접종 종류를 조회한다.
     *
     * @param vaccinationTypeId 예방접종 종류 ID (없으면 null)
     * @return 예방접종 종류 엔티티 또는 null
     * @throws IllegalArgumentException 예방접종 종류를 찾을 수 없을 경우
     */
    private VaccinationType resolveVaccinationType(Long vaccinationTypeId) {
        if (vaccinationTypeId == null) return null;
        return vaccinationTypeRepository.findById(vaccinationTypeId)
                .orElseThrow(() -> new IllegalArgumentException("접종종류를 찾을 수 없습니다: " + vaccinationTypeId));
    }

    /**
     * [목적] 일정 ID와 사용자 그룹 ID로 일정을 조회하여 그룹 접근 권한을 검증한다.
     *
     * @param scheduleId 일정 UUID
     * @param userId     요청 사용자 UUID
     * @return 일정 엔티티
     * @throws IllegalArgumentException 일정이 없거나 그룹에 속하지 않을 경우
     */
    private Schedule findByIdAndGroupId(UUID scheduleId, UUID userId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        return scheduleRepository.findByIdAndGroupId(scheduleId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다."));
    }
}
