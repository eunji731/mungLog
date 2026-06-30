package com.munglog.backend.domain.pet.service;

import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.common.file.service.AttachedFileService;
import com.munglog.backend.common.file.service.FileStorageService;
import com.munglog.backend.domain.family.domain.FamilyGroup;
import com.munglog.backend.domain.family.service.FamilyGroupService;
import com.munglog.backend.domain.pet.domain.Pet;
import com.munglog.backend.domain.pet.dto.PetRequest;
import com.munglog.backend.domain.pet.dto.PetResponse;
import com.munglog.backend.domain.pet.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PetService {

    private final PetRepository petRepository;
    private final FamilyGroupService familyGroupService;
    private final AttachedFileService attachedFileService;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<PetResponse> getPets(UUID userId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        return petRepository.findByGroupIdAndIsActiveTrue(groupId).stream()
                .map(pet -> PetResponse.from(pet, resolvePhotoUrl(pet)))
                .toList();
    }

    @Transactional(readOnly = true)
    public PetResponse getPet(UUID petId, UUID userId) {
        Pet pet = findByIdAndGroupId(petId, userId);
        return PetResponse.from(pet, resolvePhotoUrl(pet));
    }

    @Transactional
    public PetResponse createPet(UUID userId, PetRequest request, MultipartFile profileImage) {
        FamilyGroup group = familyGroupService.getGroupByUserId(userId);

        String regNum = (request.getRegistrationNumber() != null && !request.getRegistrationNumber().isBlank())
                ? request.getRegistrationNumber().trim() : null;

        Pet pet = Pet.builder()
                .group(group)
                .name(request.getName())
                .breed(request.getBreed())
                .birthDate(request.getBirthDate())
                .adoptionDate(request.getAdoptionDate())
                .gender(request.getGender())
                .weightKg(request.getWeightKg())
                .personality(request.getTraits())
                .appearance(request.getAppearance())
                .likes(request.getLikes())
                .dislikes(request.getDislikes())
                .diaryTone(request.getDiaryTone())
                .registrationNumber(regNum)
                .isNeutered(request.getIsNeutered() != null ? request.getIsNeutered() : false)
                .memo(request.getMemo())
                .build();

        pet = petRepository.save(pet);

        if (profileImage != null && !profileImage.isEmpty()) {
            attachedFileService.saveAll(ParentDomainType.PET_PROFILE, pet.getId(), List.of(profileImage));
        }

        return PetResponse.from(pet, resolvePhotoUrl(pet));
    }

    @Transactional
    public PetResponse updatePet(UUID petId, UUID userId, PetRequest request, MultipartFile profileImage) {
        Pet pet = findByIdAndGroupId(petId, userId);

        String profileImagePath = pet.getProfileImagePath();

        if (profileImage != null && !profileImage.isEmpty()) {
            attachedFileService.replaceSingle(ParentDomainType.PET_PROFILE, petId, profileImage);
        }

        pet.updateAll(request.getName(), request.getBreed(), request.getBirthDate(),
                request.getAdoptionDate(), request.getGender(), request.getWeightKg(),
                profileImagePath, request.getTraits(), request.getAppearance(),
                request.getLikes(), request.getDislikes(), request.getDiaryTone(),
                request.getRegistrationNumber(), request.getIsNeutered(), request.getMemo());

        petRepository.save(pet);
        return PetResponse.from(pet, resolvePhotoUrl(pet));
    }

    @Transactional
    public void deletePet(UUID petId, UUID userId) {
        Pet pet = findByIdAndGroupId(petId, userId);
        pet.delete();
        petRepository.save(pet);
    }

    private String resolvePhotoUrl(Pet pet) {
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.PET_PROFILE, pet.getId());
        if (!files.isEmpty()) {
            return files.get(0).getFileUrl();
        }
        if (pet.getProfileImagePath() != null) {
            return fileStorageService.getFileUrl(pet.getProfileImagePath());
        }
        return null;
    }

    private Pet findByIdAndGroupId(UUID petId, UUID userId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        return petRepository.findByIdAndGroupId(petId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("반려동물을 찾을 수 없습니다."));
    }
}
