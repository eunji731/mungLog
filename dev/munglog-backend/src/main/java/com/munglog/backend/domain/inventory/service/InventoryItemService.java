package com.munglog.backend.domain.inventory.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.common.file.service.AttachedFileService;
import com.munglog.backend.domain.family.domain.FamilyGroup;
import com.munglog.backend.domain.family.service.FamilyGroupService;
import com.munglog.backend.domain.inventory.domain.InventoryItem;
import com.munglog.backend.domain.inventory.domain.ItemCategory;
import com.munglog.backend.domain.inventory.domain.StorageMethod;
import com.munglog.backend.domain.inventory.dto.InventoryItemRequest;
import com.munglog.backend.domain.inventory.dto.InventoryItemResponse;
import com.munglog.backend.domain.inventory.repository.InventoryItemRepository;
import com.munglog.backend.domain.pet.domain.Pet;
import com.munglog.backend.domain.pet.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * 반려동물 용품 서비스.
 * 용품 등록·조회·수정·삭제 및 급여 상태 토글 비즈니스 로직을 처리하는 클래스.
 * 성분 목록은 JSON 문자열로 DB에 저장하고, 응답 시 List<String>으로 역직렬화한다.
 * 주요 기능: 용품 CRUD, 급여 토글, 성분 JSON 직렬화/역직렬화
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final FamilyGroupService familyGroupService;
    private final PetRepository petRepository;
    private final AttachedFileService attachedFileService;
    private final ObjectMapper objectMapper;

    /**
     * [목적] 새 용품을 등록한다.
     * [설명] 사용자 그룹을 조회하고 InventoryItem 엔티티를 저장한다.
     *        이미지가 있으면 AttachedFileService를 통해 별도 저장한다.
     *        성분 목록은 JSON 문자열로 변환하여 저장한다.
     *
     * @param userId  등록 사용자 UUID
     * @param request 용품 정보 DTO
     * @param images  용품 이미지 목록 (없으면 null)
     * @return 등록된 용품 응답 DTO
     */
    @Transactional
    public InventoryItemResponse createItem(UUID userId, InventoryItemRequest request, List<MultipartFile> images) {
        FamilyGroup group = familyGroupService.getGroupByUserId(userId);

        Pet pet = (request.getPetId() != null)
                ? petRepository.findById(request.getPetId()).orElse(null)
                : null;

        InventoryItem item = InventoryItem.builder()
                .group(group)
                .pet(pet)
                .name(request.getName())
                .category(parseEnum(ItemCategory.class, request.getCategory()))
                .brand(request.getBrand())
                .flavor(request.getFlavor())
                .productionDate(parseDate(request.getProductionDate()))
                .expiryDateText(request.getExpiryDateText())
                .expiryDateSpecific(parseDate(request.getExpiryDateSpecific()))
                .openedAt(parseDate(request.getOpenedAt()))
                .ingredients(toIngredientsJson(request.getIngredients()))
                .material(request.getMaterial())
                .size(request.getSize())
                .storageMethod(parseEnum(StorageMethod.class, request.getStorageMethod()))
                .suggestedUsage(request.getSuggestedUsage())
                .rating(request.getRating())
                .stock(request.getStock())
                .price(parsePrice(request.getPrice()))
                .addedAt(LocalDate.now())
                .build();

        item = inventoryItemRepository.save(item);

        if (images != null && !images.isEmpty()) {
            attachedFileService.saveAll(ParentDomainType.INVENTORY, item.getId(), images);
        }

        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.INVENTORY, item.getId());
        return InventoryItemResponse.from(item, files, fromIngredientsJson(item.getIngredients()));
    }

    /**
     * [목적] 현재 사용자 그룹의 용품 목록을 조회한다.
     * [설명] 그룹이 없으면 빈 목록을 반환하며, 각 용품의 이미지와 성분도 함께 포함한다.
     *
     * @param userId 조회 사용자 UUID
     * @return 용품 응답 DTO 목록 (그룹 없으면 빈 목록)
     */
    @Transactional(readOnly = true)
    public List<InventoryItemResponse> getItems(UUID userId) {
        return familyGroupService.findGroupIdByUserId(userId)
                .map(groupId -> inventoryItemRepository.findAllByGroupIdOrderByCreatedAtDesc(groupId).stream()
                        .map(item -> InventoryItemResponse.from(item,
                                attachedFileService.getFiles(ParentDomainType.INVENTORY, item.getId()),
                                fromIngredientsJson(item.getIngredients())))
                        .toList())
                .orElse(List.of());
    }

    /**
     * [목적] 특정 용품의 상세 정보를 조회한다.
     * [설명] 그룹 소속 여부를 검증하여 타 그룹 데이터에 접근하지 못하도록 한다.
     *
     * @param itemId 조회할 용품 UUID
     * @param userId 요청 사용자 UUID
     * @return 용품 응답 DTO
     * @throws IllegalArgumentException 용품이 없거나 그룹 접근 권한이 없을 경우
     */
    @Transactional(readOnly = true)
    public InventoryItemResponse getItem(UUID itemId, UUID userId) {
        InventoryItem item = findByIdAndGroupId(itemId, userId);
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.INVENTORY, item.getId());
        return InventoryItemResponse.from(item, files, fromIngredientsJson(item.getIngredients()));
    }

    /**
     * [목적] 용품 정보를 수정한다.
     * [설명] 기존 이미지 중 deletedFileIds 목록은 삭제하고, 새 이미지를 추가하는 syncFiles를 사용한다.
     *
     * @param itemId  수정할 용품 UUID
     * @param userId  요청 사용자 UUID
     * @param request 수정할 용품 정보 DTO
     * @param images  새 이미지 목록 (없으면 null)
     * @return 수정된 용품 응답 DTO
     * @throws IllegalArgumentException 용품이 없거나 그룹 접근 권한이 없을 경우
     */
    @Transactional
    public InventoryItemResponse updateItem(UUID itemId, UUID userId, InventoryItemRequest request, List<MultipartFile> images) {
        InventoryItem item = findByIdAndGroupId(itemId, userId);

        Pet pet = (request.getPetId() != null)
                ? petRepository.findById(request.getPetId()).orElse(null)
                : null;

        item.update(request.getName(),
                parseEnum(ItemCategory.class, request.getCategory()),
                request.getBrand(), request.getFlavor(),
                parseDate(request.getProductionDate()), request.getExpiryDateText(),
                parseDate(request.getExpiryDateSpecific()), parseDate(request.getOpenedAt()),
                toIngredientsJson(request.getIngredients()), request.getMaterial(), request.getSize(),
                parseEnum(StorageMethod.class, request.getStorageMethod()), request.getSuggestedUsage(),
                request.getRating(), request.getStock(), parsePrice(request.getPrice()), pet);

        inventoryItemRepository.save(item);

        List<FileResponse> files = attachedFileService.syncFiles(
                ParentDomainType.INVENTORY, itemId, request.getDeletedFileIds(), images);

        return InventoryItemResponse.from(item, files, fromIngredientsJson(item.getIngredients()));
    }

    /**
     * [목적] 용품을 삭제한다.
     * [설명] 첨부 이미지도 함께 삭제한다.
     *
     * @param itemId 삭제할 용품 UUID
     * @param userId 요청 사용자 UUID
     * @throws IllegalArgumentException 용품이 없거나 그룹 접근 권한이 없을 경우
     */
    @Transactional
    public void deleteItem(UUID itemId, UUID userId) {
        InventoryItem item = findByIdAndGroupId(itemId, userId);
        attachedFileService.deleteAllByParent(ParentDomainType.INVENTORY, itemId);
        inventoryItemRepository.delete(item);
    }

    /**
     * [목적] 용품의 급여 중(isFeeding) 상태를 토글한다.
     *
     * @param itemId 토글할 용품 UUID
     * @param userId 요청 사용자 UUID
     * @return 변경된 용품 응답 DTO
     * @throws IllegalArgumentException 용품이 없거나 그룹 접근 권한이 없을 경우
     */
    @Transactional
    public InventoryItemResponse toggleFeeding(UUID itemId, UUID userId) {
        InventoryItem item = findByIdAndGroupId(itemId, userId);
        item.toggleFeeding();
        inventoryItemRepository.save(item);
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.INVENTORY, item.getId());
        return InventoryItemResponse.from(item, files, fromIngredientsJson(item.getIngredients()));
    }

    /**
     * [목적] 용품 ID와 사용자 그룹 ID로 용품을 조회하여 그룹 접근 권한을 검증한다.
     *
     * @param itemId 용품 UUID
     * @param userId 요청 사용자 UUID
     * @return 용품 엔티티
     * @throws IllegalArgumentException 용품이 없거나 그룹에 속하지 않을 경우
     */
    private InventoryItem findByIdAndGroupId(UUID itemId, UUID userId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        return inventoryItemRepository.findByIdAndGroupId(itemId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("아이템을 찾을 수 없습니다."));
    }

    /**
     * [목적] 문자열을 지정한 enum 타입으로 변환한다.
     * [설명] 값이 null이거나 일치하는 enum이 없으면 null을 반환한다.
     *
     * @param clazz enum 클래스 타입
     * @param value 변환할 문자열
     * @return enum 값 또는 null
     */
    private <T extends Enum<T>> T parseEnum(Class<T> clazz, String value) {
        if (value == null || value.isBlank()) return null;
        try { return Enum.valueOf(clazz, value); } catch (IllegalArgumentException e) { return null; }
    }

    /**
     * [목적] "yyyy-MM-dd" 형식의 날짜 문자열을 LocalDate로 변환한다.
     * [설명] 파싱 실패 시 null을 반환한다.
     *
     * @param value 날짜 문자열
     * @return LocalDate 또는 null
     */
    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try { return LocalDate.parse(value); } catch (Exception e) { return null; }
    }

    /**
     * [목적] 가격 문자열을 BigDecimal로 변환한다.
     * [설명] 파싱 실패 시 null을 반환한다.
     *
     * @param value 가격 문자열
     * @return BigDecimal 또는 null
     */
    private BigDecimal parsePrice(String value) {
        if (value == null || value.isBlank()) return null;
        try { return new BigDecimal(value); } catch (NumberFormatException e) { return null; }
    }

    /**
     * [목적] 성분 목록을 JSON 문자열로 직렬화한다.
     * [설명] DB에는 JSON 배열 문자열로 저장한다. 직렬화 실패 시 null을 반환한다.
     *
     * @param ingredients 성분 목록
     * @return JSON 문자열 또는 null
     */
    private String toIngredientsJson(List<String> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(ingredients);
        } catch (Exception e) {
            log.warn("성분 목록 직렬화 실패", e);
            return null;
        }
    }

    /**
     * [목적] JSON 문자열로 저장된 성분 목록을 List<String>으로 역직렬화한다.
     * [설명] 역직렬화 실패 시 빈 목록을 반환한다.
     *
     * @param json JSON 문자열
     * @return 성분 목록 (실패 시 빈 목록)
     */
    private List<String> fromIngredientsJson(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.warn("성분 목록 역직렬화 실패", e);
            return Collections.emptyList();
        }
    }
}
