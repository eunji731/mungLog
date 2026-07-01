package com.munglog.backend.domain.family.service;

import com.munglog.backend.domain.care.repository.CareRecordRepository;
import com.munglog.backend.domain.care.repository.ExpenseDetailRepository;
import com.munglog.backend.domain.care.repository.MedicalDetailRepository;
import com.munglog.backend.domain.inventory.repository.InventoryItemRepository;
import com.munglog.backend.domain.memory.repository.MemoryDogRepository;
import com.munglog.backend.domain.memory.repository.MemoryMomentRepository;
import com.munglog.backend.domain.memory.repository.MemoryRepository;
import com.munglog.backend.domain.memory.repository.PhotoRepository;
import com.munglog.backend.domain.memory.repository.PhotoThemeTagRepository;
import com.munglog.backend.domain.pet.repository.PetRepository;
import com.munglog.backend.domain.schedule.repository.ScheduleRepository;
import com.munglog.backend.domain.symptom.repository.CareRecordSymptomRepository;
import com.munglog.backend.domain.symptom.repository.ScheduleSymptomRepository;
import com.munglog.backend.domain.symptom.repository.SymptomSnapSymptomRepository;
import com.munglog.backend.domain.symptomsnap.repository.SymptomSnapRepository;
import com.munglog.backend.domain.vaccination.repository.VaccinationAliasRepository;
import com.munglog.backend.domain.vaccination.repository.VaccinationTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GroupDataCleanupService {

    private final PhotoThemeTagRepository photoThemeTagRepository;
    private final PhotoRepository photoRepository;
    private final MemoryMomentRepository memoryMomentRepository;
    private final MemoryDogRepository memoryDogRepository;
    private final MemoryRepository memoryRepository;
    private final CareRecordSymptomRepository careRecordSymptomRepository;
    private final MedicalDetailRepository medicalDetailRepository;
    private final ExpenseDetailRepository expenseDetailRepository;
    private final CareRecordRepository careRecordRepository;
    private final ScheduleSymptomRepository scheduleSymptomRepository;
    private final ScheduleRepository scheduleRepository;
    private final SymptomSnapSymptomRepository symptomSnapSymptomRepository;
    private final SymptomSnapRepository symptomSnapRepository;
    private final PetRepository petRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final VaccinationAliasRepository vaccinationAliasRepository;
    private final VaccinationTypeRepository vaccinationTypeRepository;

    @Transactional
    public void deleteAllGroupData(UUID groupId) {
        // Memory 계열: leaf → root 순서
        photoThemeTagRepository.deleteAllByGroupId(groupId);
        memoryRepository.clearRepresentativePhotosByGroupId(groupId); // Photo 삭제 전 역참조 FK 해제
        photoRepository.deleteAllByGroupId(groupId);
        memoryMomentRepository.deleteAllByGroupId(groupId);
        memoryDogRepository.deleteAllByGroupId(groupId);
        memoryRepository.deleteAllByGroupId(groupId);

        // CareRecord 계열
        careRecordSymptomRepository.deleteAllByGroupId(groupId);
        medicalDetailRepository.deleteAllByGroupId(groupId);
        expenseDetailRepository.deleteAllByGroupId(groupId);
        careRecordRepository.deleteAllByGroupId(groupId);

        // Schedule 계열
        scheduleSymptomRepository.deleteAllByGroupId(groupId);
        scheduleRepository.deleteAllByGroupId(groupId);

        // SymptomSnap 계열
        symptomSnapSymptomRepository.deleteAllByGroupId(groupId);
        symptomSnapRepository.deleteAllByGroupId(groupId);

        // InventoryItem이 Pet FK 참조 → Pet보다 먼저 삭제
        inventoryItemRepository.deleteAllByGroupId(groupId);

        // Pet (CareRecord/Schedule/SymptomSnap/InventoryItem 삭제 후)
        petRepository.deleteAllByGroupId(groupId);

        vaccinationAliasRepository.deleteAllByGroupId(groupId);
        vaccinationTypeRepository.deleteAllByGroupId(groupId);
    }
}
