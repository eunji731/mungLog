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
import com.munglog.backend.domain.family.domain.FamilyGroup;
import com.munglog.backend.domain.family.service.FamilyGroupService;
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
    private final FamilyGroupService familyGroupService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public AiUsageResponse getUsage(UUID userId, LocalDate targetDate) {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = LocalDateTime.of(today, LocalTime.MIDNIGHT);
        LocalDateTime todayEnd = LocalDateTime.of(today, LocalTime.MAX);

        long dateCount = aiDiaryUsageRepository.countByMember_IdAndUsageTypeAndTargetDateAndCalledAtBetween(
                userId, USAGE_TYPE_ANALYZE, targetDate, todayStart, todayEnd);
        long dailyTotal = aiDiaryUsageRepository.countByMember_IdAndUsageTypeAndCalledAtBetween(
                userId, USAGE_TYPE_DAILY, todayStart, todayEnd);
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
                                      List<PetInfoRequest> petInfos, List<String> userTags) {
        checkRateLimit(userId, targetDate);

        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<StoredFileInfo> storedFiles = new ArrayList<>();
        List<String> base64Images = new ArrayList<>();
        List<String> imageFileNames = new ArrayList<>();

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
                imageFileNames.add(file.getOriginalFilename());
            } catch (Exception e) {
                log.warn("이미지 base64 변환 실패: {}", file.getOriginalFilename(), e);
            }
        }

        List<Pet> selectedPets = petInfos != null
                ? petInfos.stream()
                    .flatMap(p -> petRepository.findById(p.id()).stream())
                    .toList()
                : List.of();
        String petContext = buildPetContext(selectedPets);
        String prompt = buildAnalyzePrompt(targetDate.toString(), petContext, member.getAiContext(), imageFileNames, storedFiles, userTags);
        DailyLogResponse aiResult = geminiClient.analyzeImages(base64Images, imageFileNames, prompt);

        recordUsage(member, targetDate, USAGE_TYPE_ANALYZE);
        recordUsage(member, targetDate, USAGE_TYPE_DAILY);

        return AnalyzeDiaryResult.builder().aiResult(aiResult).storedFiles(storedFiles).build();
    }

    @Transactional
    public UUID saveDiary(UUID userId, SaveDiaryRequest request) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        FamilyGroup group = familyGroupService.getGroupByUserId(userId);

        // 재분석 저장 시 기존 Memory 교체 (중복 생성 방지)
        if (request.getOldMemoryId() != null) {
            memoryRepository.findByIdAndUser_Id(request.getOldMemoryId(), userId).ifPresent(old -> {
                old.setRepresentativePhoto(null);
                memoryRepository.delete(old);
                memoryRepository.flush();
            });
        }

        Memory memory = memoryRepository.save(Memory.builder()
                .user(member)
                .group(group)
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

                                    String thumb100 = fileStorageService.storeThumbnail(sf.getStoredPath(), 100);
                                    String thumb300 = fileStorageService.storeThumbnail(sf.getStoredPath(), 300);
                                    photo.updateThumbs(thumb100, thumb300);

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
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = LocalDateTime.of(today, LocalTime.MIDNIGHT);
        LocalDateTime todayEnd = LocalDateTime.of(today, LocalTime.MAX);

        long dateCount = aiDiaryUsageRepository.countByMember_IdAndUsageTypeAndTargetDateAndCalledAtBetween(
                userId, USAGE_TYPE_ANALYZE, targetDate, todayStart, todayEnd);
        if (dateCount >= DATE_LIMIT) throw AiRateLimitException.dateLimitExceeded(targetDate.toString());

        long dailyTotal = aiDiaryUsageRepository.countByMember_IdAndUsageTypeAndCalledAtBetween(
                userId, USAGE_TYPE_DAILY, todayStart, todayEnd);
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

    private String buildPetContext(List<Pet> pets) {
        if (pets.isEmpty()) return "알 수 없음";
        StringBuilder sb = new StringBuilder();
        for (Pet pet : pets) {
            sb.append("- ").append(pet.getName());
            if (pet.getBreed() != null) sb.append("(").append(pet.getBreed()).append(")");
            if (pet.getPersonality() != null) sb.append(", 성격/특징: ").append(pet.getPersonality());
            if (pet.getAppearance() != null) sb.append(", 외모: ").append(pet.getAppearance());
            if (pet.getLikes() != null) sb.append(", 좋아하는 것: ").append(pet.getLikes());
            if (pet.getDislikes() != null) sb.append(", 싫어하는 것: ").append(pet.getDislikes());
            if (pet.getDiaryTone() != null) sb.append(", 일기 말투: ").append(pet.getDiaryTone());
            sb.append("\n");
        }
        return sb.toString().stripTrailing();
    }

    private String buildAnalyzePrompt(String targetDate, String petContext, String userAiContext,
                                      List<String> imageFileNames, List<StoredFileInfo> storedFiles,
                                      List<String> userTags) {
        StringBuilder gpsInfo = new StringBuilder();
        for (int i = 0; i < imageFileNames.size(); i++) {
            if (i < storedFiles.size()) {
                StoredFileInfo sf = storedFiles.get(i);
                if (sf.getLatitude() != null && sf.getLongitude() != null) {
                    gpsInfo.append(String.format("- %s: 위도 %.6f, 경도 %.6f%n",
                            imageFileNames.get(i), sf.getLatitude(), sf.getLongitude()));
                }
            }
        }

        String gpsSection = gpsInfo.isEmpty() ? "" : String.format("""

                각 사진의 GPS 좌표 정보:
                %s
                위 좌표를 참고하여 locationName에 실제 한국 장소명(예: 서울숲, 혜화동, 경의선숲길, 한강공원 등 구체적인 POI 이름이나 동네명)을 추론해서 넣어주세요.
                GPS가 없는 사진은 사진 내용을 보고 추측하세요.
                """, gpsInfo);

        String userTagsSection = (userTags != null && !userTags.isEmpty())
                ? "사용자 키워드(반드시 일기 내용, 장소명, tags에 이 키워드들을 최대한 반영하세요): " + String.join(", ", userTags) + "\n"
                : "";

        String userContextSection = (userAiContext != null && !userAiContext.isBlank())
                ? "반드시 반영할 사용자 개인 맥락(이 내용을 일기 전체 톤과 내용에 꼭 반영하세요): " + userAiContext + "\n"
                : "";

        return String.format("""
                날짜: %s

                [반려동물 정보 - 아래 성격/말투/특징을 일기에 반드시 반영하세요]
                %s

                %s%s%s
                위 사진들을 분석하여 반려동물이 직접 쓴 1인칭 일기 형식으로 작성해주세요.
                반려동물 본인의 시점으로, "오늘 한강에 갔다", "냄새가 너무 좋았다", "주인이랑 같이 뛰었는데 신났다" 같은 식으로 자연스럽고 귀엽게 써주세요.
                특히 위에 명시된 성격/말투를 철저히 따라 써주세요. 예: 말투가 "~했다냥"이면 모든 문장을 그 말투로 써주세요.
                aiTitle과 aiSummary, aiContent 모두 반려동물 1인칭으로 작성하세요.
                각 사진 바로 앞에는 "[사진 파일명: 실제파일명]" 형태의 라벨이 붙어 있습니다.
                moments의 photoFileNames에는 그 사진에 해당하는 라벨의 파일명을 정확히 그대로(대소문자, 확장자 포함) 적어주세요. 파일명을 변형하거나 새로 만들지 마세요.
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
                      "photoDetails": [
                        {
                          "fileName": "파일명 (photoFileNames의 값과 동일하게)",
                          "themeTags": ["산책", "공원", "놀이"],
                          "photoComment": "이 사진에 대한 한 줄 감성 코멘트",
                          "vibeScore": 8,
                          "isBest": false
                        }
                      ]
                    }
                  ]
                }
                photoDetails 작성 규칙:
                - photoDetails는 photoFileNames에 나열된 파일마다 반드시 하나씩 작성하세요.
                - fileName은 photoFileNames의 값을 그대로 복사하세요.
                - themeTags는 사진의 내용을 잘 나타내는 한국어 키워드 2~5개 (예: "산책", "공원", "간식", "목욕", "병원", "놀이" 등)
                - vibeScore는 1~10 사이 정수 (사진의 밝고 행복한 분위기 점수)
                - isBest는 이 moment에서 가장 대표적인 사진 한 장에만 true, 나머지는 false
                """,
                targetDate,
                petContext,
                userContextSection,
                userTagsSection,
                gpsSection);
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
