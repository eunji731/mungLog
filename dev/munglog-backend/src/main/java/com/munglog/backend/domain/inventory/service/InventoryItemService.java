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

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final FamilyGroupService familyGroupService;
    private final PetRepository petRepository;
    private final AttachedFileService attachedFileService;
    private final ObjectMapper objectMapper;

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

    @Transactional(readOnly = true)
    public InventoryItemResponse getItem(UUID itemId, UUID userId) {
        InventoryItem item = findByIdAndGroupId(itemId, userId);
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.INVENTORY, item.getId());
        return InventoryItemResponse.from(item, files, fromIngredientsJson(item.getIngredients()));
    }

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

    @Transactional
    public void deleteItem(UUID itemId, UUID userId) {
        InventoryItem item = findByIdAndGroupId(itemId, userId);
        attachedFileService.deleteAllByParent(ParentDomainType.INVENTORY, itemId);
        inventoryItemRepository.delete(item);
    }

    @Transactional
    public InventoryItemResponse toggleFeeding(UUID itemId, UUID userId) {
        InventoryItem item = findByIdAndGroupId(itemId, userId);
        item.toggleFeeding();
        inventoryItemRepository.save(item);
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.INVENTORY, item.getId());
        return InventoryItemResponse.from(item, files, fromIngredientsJson(item.getIngredients()));
    }

    private InventoryItem findByIdAndGroupId(UUID itemId, UUID userId) {
        UUID groupId = familyGroupService.getGroupIdByUserId(userId);
        return inventoryItemRepository.findByIdAndGroupId(itemId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("아이템을 찾을 수 없습니다."));
    }

    private <T extends Enum<T>> T parseEnum(Class<T> clazz, String value) {
        if (value == null || value.isBlank()) return null;
        try { return Enum.valueOf(clazz, value); } catch (IllegalArgumentException e) { return null; }
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try { return LocalDate.parse(value); } catch (Exception e) { return null; }
    }

    private BigDecimal parsePrice(String value) {
        if (value == null || value.isBlank()) return null;
        try { return new BigDecimal(value); } catch (NumberFormatException e) { return null; }
    }

    private String toIngredientsJson(List<String> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(ingredients);
        } catch (Exception e) {
            log.warn("성분 목록 직렬화 실패", e);
            return null;
        }
    }

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
