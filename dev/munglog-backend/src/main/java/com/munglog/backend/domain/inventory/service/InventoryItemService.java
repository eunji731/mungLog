package com.munglog.backend.domain.inventory.service;

import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.dto.FileResponse;
import com.munglog.backend.common.file.service.AttachedFileService;
import com.munglog.backend.domain.inventory.domain.InventoryItem;
import com.munglog.backend.domain.inventory.domain.ItemCategory;
import com.munglog.backend.domain.inventory.domain.StorageMethod;
import com.munglog.backend.domain.inventory.dto.InventoryItemRequest;
import com.munglog.backend.domain.inventory.dto.InventoryItemResponse;
import com.munglog.backend.domain.inventory.repository.InventoryItemRepository;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final MemberRepository memberRepository;
    private final AttachedFileService attachedFileService;

    @Transactional
    public InventoryItemResponse createItem(UUID userId, InventoryItemRequest request, List<MultipartFile> images) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        InventoryItem item = InventoryItem.builder()
                .user(member)
                .name(request.getName())
                .category(parseEnum(ItemCategory.class, request.getCategory()))
                .brand(request.getBrand())
                .flavor(request.getFlavor())
                .purchaseDate(parseDate(request.getPurchaseDate()))
                .expiryDate(parseDate(request.getExpiryDate()))
                .ingredients(request.getIngredients())
                .material(request.getMaterial())
                .size(request.getSize())
                .storageMethod(parseEnum(StorageMethod.class, request.getStorageMethod()))
                .rating(request.getRating())
                .stock(request.getStock())
                .price(request.getPrice() != null ? new BigDecimal(request.getPrice()) : null)
                .addedAt(LocalDate.now())
                .build();

        item = inventoryItemRepository.save(item);

        if (images != null && !images.isEmpty()) {
            attachedFileService.saveAll(ParentDomainType.INVENTORY, item.getId(), images);
        }

        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.INVENTORY, item.getId());
        return InventoryItemResponse.from(item, files);
    }

    @Transactional(readOnly = true)
    public List<InventoryItemResponse> getItems(UUID userId) {
        return inventoryItemRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(item -> InventoryItemResponse.from(item,
                        attachedFileService.getFiles(ParentDomainType.INVENTORY, item.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public InventoryItemResponse getItem(UUID itemId, UUID userId) {
        InventoryItem item = findByIdAndUserId(itemId, userId);
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.INVENTORY, item.getId());
        return InventoryItemResponse.from(item, files);
    }

    @Transactional
    public InventoryItemResponse updateItem(UUID itemId, UUID userId, InventoryItemRequest request, List<MultipartFile> images) {
        InventoryItem item = findByIdAndUserId(itemId, userId);

        item.update(request.getName(),
                parseEnum(ItemCategory.class, request.getCategory()),
                request.getBrand(), request.getFlavor(),
                parseDate(request.getPurchaseDate()), parseDate(request.getExpiryDate()),
                request.getIngredients(), request.getMaterial(), request.getSize(),
                parseEnum(StorageMethod.class, request.getStorageMethod()),
                request.getRating(), request.getStock(),
                request.getPrice() != null ? new BigDecimal(request.getPrice()) : null);

        inventoryItemRepository.save(item);

        if (images != null && !images.isEmpty()) {
            attachedFileService.saveAll(ParentDomainType.INVENTORY, itemId, images);
        }

        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.INVENTORY, item.getId());
        return InventoryItemResponse.from(item, files);
    }

    @Transactional
    public void deleteItem(UUID itemId, UUID userId) {
        InventoryItem item = findByIdAndUserId(itemId, userId);
        attachedFileService.deleteAllByParent(ParentDomainType.INVENTORY, itemId);
        inventoryItemRepository.delete(item);
    }

    @Transactional
    public InventoryItemResponse toggleFeeding(UUID itemId, UUID userId) {
        InventoryItem item = findByIdAndUserId(itemId, userId);
        item.toggleFeeding();
        inventoryItemRepository.save(item);
        List<FileResponse> files = attachedFileService.getFiles(ParentDomainType.INVENTORY, item.getId());
        return InventoryItemResponse.from(item, files);
    }

    private InventoryItem findByIdAndUserId(UUID itemId, UUID userId) {
        return inventoryItemRepository.findByIdAndUserId(itemId, userId)
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
}
