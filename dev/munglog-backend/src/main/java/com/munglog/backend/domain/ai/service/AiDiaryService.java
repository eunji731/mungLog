package com.munglog.backend.domain.ai.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.exif.GpsDirectory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.munglog.backend.common.ai.GeminiClient;
import com.munglog.backend.common.exception.AiRateLimitException;
import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.dto.StoredFileInfo;
import com.munglog.backend.common.file.service.AttachedFileService;
import com.munglog.backend.common.file.service.FileStorageService;
import com.munglog.backend.domain.ai.domain.AiDiaryUsage;
import com.munglog.backend.domain.ai.dto.*;
import com.munglog.backend.domain.ai.repository.AiDiaryUsageRepository;
import com.munglog.backend.domain.member.domain.Member;
import com.munglog.backend.domain.member.repository.MemberRepository;
import com.munglog.backend.domain.memory.domain.*;
import com.munglog.backend.domain.memory.repository.*;
import com.munglog.backend.domain.pet.domain.Pet;
import com.munglog.backend.domain.pet.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiDiaryService {

    private static final int DATE_LIMIT = 2;
    private static final int DAILY_LIMIT = 10;
    private static final String USAGE_TYPE_ANALYZE = "ANALYZE";
    private static final String USAGE_TYPE_DAILY = "DAILY";

    private final GeminiClient geminiClient;
    private final MemberRepository memberRepository;
    private final PetRepository petRepository;
    private final MemoryRepository memoryRepository;
    private final MemoryDogRepository memoryDogRepository;
    private final MemoryMomentRepository memoryMomentRepository;
    private final PhotoRepository photoRepository;
    private final PhotoThemeTagRepository photoThemeTagRepository;
    private final AiDiaryUsageRepository aiDiaryUsageRepository;
    private final AttachedFileService attachedFileService;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public AiUsageResponse getUsage(UUID userId, LocalDate targetDate) {
        long dateCount = aiDiaryUsageRepository.countByMember_IdAndUsageTypeAndTargetDate(userId, USAGE_TYPE_ANALYZE, targetDate);
        long dailyTotal = aiDiaryUsageRepository.countByMember_IdAndUsageTypeAndCalledAtBetween(
                userId, USAGE_TYPE_DAILY,
                LocalDateTime.of(targetDate, LocalTime.MIDNIGHT),
                LocalDateTime.of(targetDate, LocalTime.MAX));
        return AiUsageResponse.builder()
                .dateCount(dateCount).dateLimit(DATE_LIMIT)
                .dailyTotal(dailyTotal).dailyLimit(DAILY_LIMIT)
                .dateBlocked(dateCount >= DATE_LIMIT)
                .dailyBlocked(dailyTotal >= DAILY_LIMIT)
                .build();
    }

    public List<CheckMetadataResponse> checkMetadata(List<MultipartFile> files) {
        return files.stream().map(file -> {
            ExifMeta exif = extractExif(file);
            return CheckMetadataResponse.builder()
                    .originalName(file.getOriginalFilename())
                    .hasDate(exif.takenAt() != null)
                    .hasGps(exif.latitude() != null && exif.longitude() != null)
                    .build();
        }).toList();
    }

    @Transactional
    public AnalyzeDiaryResult analyze(UUID userId, LocalDate targetDate, List<MultipartFile> files,
                                      List<PetInfoRequest> petInfos) {
        checkRateLimit(userId, targetDate);

        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<StoredFileInfo> storedFiles = new ArrayList<>();
        List<String> base64Images = new ArrayList<>();

        for (MultipartFile file : files) {
            ExifMeta exif = extractExif(file);
            UUID tempId = UUID.randomUUID();
            String storedPath = fileStorageService.store(file, ParentDomainType.MEMORY, tempId);
            String fileUrl = fileStorageService.getFileUrl(storedPath);

            StoredFileInfo stored = StoredFileInfo.builder()
                    .originalName(file.getOriginalFilename())
                    .storedPath(storedPath)
                    .fileUrl(fileUrl)
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .takenAt(exif.takenAt())
                    .latitude(exif.latitude())
                    .longitude(exif.longitude())
                    .build();
            storedFiles.add(stored);

            try (InputStream is = fileStorageService.getInputStream(storedPath)) {
                base64Images.add(Base64.getEncoder().encodeToString(is.readAllBytes()));
            } catch (Exception e) {
                log.warn("이미지 base64 변환 실패: {}", file.getOriginalFilename(), e);
            }
        }

        String petContext = petInfos != null ? petInfos.stream()
                .map(p -> p.name()).reduce("", (a, b) -> a + ", " + b) : "";
        String prompt = buildAnalyzePrompt(targetDate.toString(), petContext, member.getAiContext());
        DailyLogResponse aiResult = geminiClient.analyzeImages(base64Images, prompt);

        recordUsage(member, targetDate, USAGE_TYPE_ANALYZE);
        recordUsage(member, targetDate, USAGE_TYPE_DAILY);

        return AnalyzeDiaryResult.builder().aiResult(aiResult).storedFiles(storedFiles).build();
    }

    @Transactional
    public UUID saveDiary(UUID userId, SaveDiaryRequest request) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Memory memory = memoryRepository.save(Memory.builder()
                .user(member)
                .memoryDate(request.getTargetDate())
                .aiTitle(request.getAiResult().aiTitle())
                .summary(request.getAiResult().aiSummary())
                .aiGenerateCount(1)
                .aiStatus("COMPLETED")
                .build());

        if (request.getPetIds() != null) {
            for (UUID petId : request.getPetIds()) {
                petRepository.findById(petId).ifPresent(pet -> {
                    memoryDogRepository.save(MemoryDog.builder()
                            .memory(memory).dog(pet).build());
                });
            }
        }

        DailyLogResponse aiResult = request.getAiResult();
        List<StoredFileInfo> storedFiles = request.getStoredFiles();

        List<Photo> allPhotos = new ArrayList<>();

        if (aiResult.moments() != null) {
            int sortOrder = 0;
            for (MomentResponse momentResp : aiResult.moments()) {
                MemoryMoment moment = memoryMomentRepository.save(MemoryMoment.builder()
                        .memory(memory)
                        .sortOrder(sortOrder++)
                        .category(momentResp.category())
                        .aiTitle(momentResp.aiTitle())
                        .aiContent(momentResp.aiContent())
                        .energyLevel(momentResp.energyLevel())
                        .locationName(momentResp.locationName())
                        .tags(momentResp.tags() != null ? String.join(",", momentResp.tags()) : null)
                        .representativePhotoPath(momentResp.representativePhotoPath())
                        .build());

                if (momentResp.photoFileNames() != null) {
                    for (String fileName : momentResp.photoFileNames()) {
                        storedFiles.stream()
                                .filter(sf -> sf.getOriginalName().equals(fileName))
                                .findFirst()
                                .ifPresent(sf -> {
                                    Photo photo = photoRepository.save(Photo.builder()
                                            .memory(memory)
                                            .moment(moment)
                                            .pathOrigin(sf.getStoredPath())
                                            .takenAt(sf.getTakenAt())
                                            .gpsLat(sf.getLatitude())
                                            .gpsLng(sf.getLongitude())
                                            .build());

                                    if (momentResp.photoDetails() != null) {
                                        momentResp.photoDetails().stream()
                                                .filter(pd -> pd.fileName().equals(fileName))
                                                .findFirst()
                                                .ifPresent(pd -> {
                                                    photo.updateAiData(pd.photoComment(), pd.vibeScore(), pd.isBest());
                                                    if (pd.themeTags() != null) {
                                                        pd.themeTags().forEach(tag ->
                                                                photoThemeTagRepository.save(PhotoThemeTag.builder()
                                                                        .photo(photo).tag(tag).build()));
                                                    }
                                                });
                                    }
                                    allPhotos.add(photo);
                                });
                    }
                }
            }
        }

        allPhotos.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsBest()))
                .findFirst()
                .or(() -> allPhotos.stream().findFirst())
                .ifPresent(memory::setRepresentativePhoto);

        return memory.getId();
    }

    private void checkRateLimit(UUID userId, LocalDate targetDate) {
        long dateCount = aiDiaryUsageRepository.countByMember_IdAndUsageTypeAndTargetDate(userId, USAGE_TYPE_ANALYZE, targetDate);
        if (dateCount >= DATE_LIMIT) throw AiRateLimitException.dateLimitExceeded(targetDate.toString());

        long dailyTotal = aiDiaryUsageRepository.countByMember_IdAndUsageTypeAndCalledAtBetween(
                userId, USAGE_TYPE_DAILY,
                LocalDateTime.of(targetDate, LocalTime.MIDNIGHT),
                LocalDateTime.of(targetDate, LocalTime.MAX));
        if (dailyTotal >= DAILY_LIMIT) throw AiRateLimitException.dailyLimitExceeded();
    }

    private void recordUsage(Member member, LocalDate targetDate, String usageType) {
        aiDiaryUsageRepository.save(AiDiaryUsage.builder()
                .member(member).targetDate(targetDate)
                .calledAt(LocalDateTime.now()).usageType(usageType)
                .build());
    }

    private ExifMeta extractExif(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            Metadata metadata = ImageMetadataReader.readMetadata(is);
            ExifSubIFDDirectory exif = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
            GpsDirectory gps = metadata.getFirstDirectoryOfType(GpsDirectory.class);

            LocalDateTime takenAt = null;
            if (exif != null && exif.getDate(ExifSubIFDDirectory.TAG_DATETIME_ORIGINAL) != null) {
                takenAt = exif.getDate(ExifSubIFDDirectory.TAG_DATETIME_ORIGINAL)
                        .toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
            }

            Double lat = null, lng = null;
            if (gps != null && gps.getGeoLocation() != null) {
                lat = gps.getGeoLocation().getLatitude();
                lng = gps.getGeoLocation().getLongitude();
            }

            return new ExifMeta(takenAt, lat, lng);
        } catch (Exception e) {
            return new ExifMeta(null, null, null);
        }
    }

    private String buildAnalyzePrompt(String targetDate, String petContext, String userAiContext) {
        return String.format("""
                날짜: %s
                반려동물: %s
                추가 맥락: %s

                위 사진들을 분석하여 반려동물의 하루를 일기 형식으로 작성해주세요.
                반드시 아래 JSON 형식으로만 응답하세요:
                {
                  "aiTitle": "제목",
                  "aiSummary": "전체 요약",
                  "moments": [
                    {
                      "category": "카테고리",
                      "aiTitle": "순간 제목",
                      "aiContent": "순간 설명",
                      "energyLevel": 5,
                      "locationName": "장소명",
                      "tags": ["태그1"],
                      "photoFileNames": ["파일명"],
                      "representativePhotoPath": null,
                      "photoDetails": []
                    }
                  ]
                }
                """,
                targetDate,
                petContext.isBlank() ? "알 수 없음" : petContext,
                userAiContext != null ? userAiContext : "");
    }

    private DailyLogResponse parseDailyLog(String aiJson) {
        try {
            return objectMapper.readValue(aiJson, DailyLogResponse.class);
        } catch (Exception e) {
            log.warn("AI 응답 파싱 실패: {}", aiJson, e);
            return DailyLogResponse.builder().aiTitle("AI 분석 완료").aiSummary(aiJson).moments(List.of()).build();
        }
    }

    private record ExifMeta(LocalDateTime takenAt, Double latitude, Double longitude) {}
}
