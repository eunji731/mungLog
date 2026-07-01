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

/**
 * 반려동물 서비스.
 * 반려동물 조회·등록·수정·소프트 삭제 비즈니스 로직을 담당하는 서비스 클래스.
 * 프로필 이미지는 AttachedFileService를 통해 별도 관리하며,
 * 레거시 profileImagePath 필드를 fallback으로 지원한다.
 * 주요 기능: 목록·단건 조회, 등록(이미지 포함), 수정, 소프트 삭제
 */
@Service
@RequiredArgsConstructor
public class PetService {

    private final PetRepository petRepository;
    private final FamilyGroupService familyGroupService;
    private final AttachedFileService attachedFileService;
    private final FileStorageService fileStorageService;

    /**
     * [목적] 현재 사용자 그룹의 활성 반려동물 목록을 조회한다.
     * [설명] 사용자의 그룹 ID를 찾고, 해당 그룹의 isActive=true 반려동물만 반환한다.
     *        그룹이 없는 경우 빈 목록을 반환한다.
     *
     * @param userId 요청 사용자 UUID
     * @return 반려동물 응답 DTO 목록 (그룹 없으면 빈 목록)
     */
    @Transactional(readOnly = true)
    public List<PetResponse> getPets(UUID userId) {
        return familyGroupService.findGroupIdByUserId(userId)
                .map(groupId -> petRepository.findByGroupIdAndIsActiveTrue(groupId).stream()
                        .map(pet -> PetResponse.from(pet, resolvePhotoUrl(pet)))
                        .toList())
                .orElse(List.of());
    }

    /**
     * [목적] 특정 반려동물의 상세 정보를 조회한다.
     * [설명] 사용자 그룹 소속 여부를 함께 검증하여 타 그룹의 데이터에 접근하지 못하도록 한다.
     *
     * @param petId  조회할 반려동물 UUID
     * @param userId 요청 사용자 UUID
     * @return 반려동물 응답 DTO
     * @throws IllegalArgumentException 반려동물이 존재하지 않거나 그룹 접근 권한이 없을 경우
     */
    @Transactional(readOnly = true)
    public PetResponse getPet(UUID petId, UUID userId) {
        Pet pet = findByIdAndGroupId(petId, userId);
        return PetResponse.from(pet, resolvePhotoUrl(pet));
    }

    /**
     * [목적] 새 반려동물을 등록한다.
     * [설명] 사용자 그룹을 조회하고 Pet 엔티티를 저장한다.
     *        프로필 이미지가 있으면 AttachedFileService를 통해 별도로 저장한다.
     *        동물등록번호가 공백이면 null로 저장한다.
     *
     * @param userId       등록 요청 사용자 UUID
     * @param request      반려동물 정보 DTO
     * @param profileImage 프로필 이미지 파일 (없으면 null)
     * @return 등록된 반려동물 응답 DTO
     * @throws IllegalStateException 사용자가 그룹에 속하지 않을 경우
     */
    @Transactional
    public PetResponse createPet(UUID userId, PetRequest request, MultipartFile profileImage) {
        FamilyGroup group = familyGroupService.getGroupByUserId(userId);

        String regNum = (request.getRegistrationNumber() != null && !request.getRegistrationNumber().isBlank())
                ? request.getRegistrationNumber().trim() : null;

        Pet pet = Pet.builder()
                .group(group)
                .registeredBy(userId)
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

    /**
     * [목적] 반려동물의 전체 정보를 수정한다.
     * [설명] 그룹 소속 여부를 검증 후 updateAll()을 호출하여 모든 필드를 갱신한다.
     *        새 프로필 이미지가 있으면 기존 이미지를 대체(replace)한다.
     *
     * @param petId        수정할 반려동물 UUID
     * @param userId       요청 사용자 UUID
     * @param request      수정할 반려동물 정보 DTO
     * @param profileImage 새 프로필 이미지 파일 (없으면 null)
     * @return 수정된 반려동물 응답 DTO
     * @throws IllegalArgumentException 반려동물이 존재하지 않거나 그룹 접근 권한이 없을 경우
     */
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

    /**
     * [목적] 반려동물을 소프트 삭제(비활성화)한다.
     * [설명] delete()를 호출하여 isActive=false로 변경하며, DB에서 실제 데이터는 유지된다.
     *
     * @param petId  삭제할 반려동물 UUID
     * @param userId 요청 사용자 UUID
     * @throws IllegalArgumentException 반려동물이 존재하지 않거나 그룹 접근 권한이 없을 경우
     */
    @Transactional
    public void deletePet(UUID petId, UUID userId) {
        Pet pet = findByIdAndGroupId(petId, userId);
        pet.delete();
        petRepository.save(pet);
    }

    /**
     * [목적] 반려동물의 프로필 이미지 URL을 해석한다.
     * [설명] 첨부파일 테이블에서 먼저 이미지를 조회하고, 없으면 레거시 profileImagePath를 URL로 변환한다.
     *        두 곳 모두 없으면 null을 반환한다.
     *
     * @param pet 반려동물 엔티티
     * @return 프로필 이미지 URL 또는 null
     */
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

    /**
     * [목적] 반려동물 ID와 사용자 그룹 ID로 반려동물을 조회한다.
     * [설명] 그룹 소속 여부를 함께 확인하여 타 그룹의 반려동물에 접근하지 못하도록 한다.
     *
     * @param petId  조회할 반려동물 UUID
     * @param userId 요청 사용자 UUID
     * @return 반려동물 엔티티
     * @throws IllegalArgumentException 반려동물이 존재하지 않거나 그룹에 속하지 않을 경우
     */
    private Pet findByIdAndGroupId(UUID petId, UUID userId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        return petRepository.findByIdAndGroupId(petId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("반려동물을 찾을 수 없습니다."));
    }
}
