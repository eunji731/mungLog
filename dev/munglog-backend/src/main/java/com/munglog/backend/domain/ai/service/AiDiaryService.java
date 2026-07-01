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

/**
 * AI 일지 분석 및 저장 비즈니스 로직을 담당하는 서비스.
 * 주요 기능: 사용량 조회·제한, 이미지 EXIF 추출, Gemini AI 분석, Memory 저장
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiDiaryService {

    /** 하루 동안 특정 날짜에 대해 허용되는 최대 AI 분석 횟수 */
    private static final int DATE_LIMIT = 2;
    /** 하루 동안 허용되는 전체 AI 사용 최대 횟수 */
    private static final int DAILY_LIMIT = 10;
    /** 날짜별 분석 사용 유형 식별자 */
    private static final String USAGE_TYPE_ANALYZE = "ANALYZE";
    /** 일별 총량 카운트 사용 유형 식별자 */
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

    /**
     * [목적] 특정 날짜에 대한 AI 사용량 현황을 조회한다.
     * [설명] 날짜별 분석 횟수(dateCount)와 오늘 하루 전체 AI 호출 횟수(dailyTotal)를 집계하여
     *        제한 초과 여부(dateBlocked, dailyBlocked)와 함께 반환한다.
     *
     * @param userId     조회할 사용자 ID
     * @param targetDate 날짜별 사용량을 확인할 기준 날짜
     * @return AI 사용량 현황 (횟수, 제한, 차단 여부)
     */
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

    /**
     * [목적] 이미지 파일 목록의 EXIF 메타데이터 포함 여부를 사전에 확인한다.
     * [설명] 각 파일에서 촬영 일시와 GPS 좌표 존재 여부를 추출하여 반환한다.
     *        파일을 저장하지 않으므로 AI 사용량이 소모되지 않는다.
     *
     * @param files 메타데이터를 확인할 이미지 파일 목록
     * @return 파일별 날짜·GPS 포함 여부 목록
     */
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

    /**
     * [목적] 업로드된 이미지들을 Gemini AI로 분석하여 반려동물 1인칭 일지를 생성한다.
     * [설명] 사용량 제한 확인 → 파일 임시 저장 → EXIF 추출 → Base64 변환 →
     *        반려동물 정보·GPS·태그를 포함한 프롬프트 생성 → Gemini 호출 → 사용량 기록 순서로 처리한다.
     *
     * @param userId     분석을 요청하는 사용자 ID
     * @param targetDate 일지 대상 날짜
     * @param files      분석할 이미지 파일 목록
     * @param petInfos   분석에 포함할 반려동물 ID·이름 목록 (null이면 전체)
     * @param userTags   일지에 반영할 사용자 직접 입력 키워드 (null 가능)
     * @return AI 분석 결과와 임시 저장된 파일 정보
     * @throws AiRateLimitException 날짜별 또는 일별 사용량 제한 초과 시
     */
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

    /**
     * [목적] AI 분석 결과를 Memory 엔티티로 데이터베이스에 영구 저장한다.
     * [설명] Memory → MemoryDog(참여 반려동물) → MemoryMoment(순간) → Photo(사진) → PhotoThemeTag(태그)
     *        순서로 계층 저장하며, 각 사진에 썸네일을 생성한다.
     *        oldMemoryId가 있으면 해당 Memory를 먼저 삭제하고 새로 생성한다(재분석 저장).
     *
     * @param userId  저장을 요청하는 사용자 ID
     * @param request 저장할 일지 데이터
     * @return 새로 생성된 Memory의 UUID
     */
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

        // isBest 사진을 대표 사진으로 설정, 없으면 첫 번째 사진 사용
        allPhotos.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsBest()))
                .findFirst()
                .or(() -> allPhotos.stream().findFirst())
                .ifPresent(memory::setRepresentativePhoto);

        return memory.getId();
    }

    /**
     * [목적] AI 사용량 제한을 초과했는지 검사하고, 초과 시 예외를 던진다.
     * [설명] 날짜별 분석 횟수(DATE_LIMIT)와 일별 전체 사용 횟수(DAILY_LIMIT)를 각각 확인한다.
     *
     * @param userId     검사할 사용자 ID
     * @param targetDate 날짜별 제한 확인에 사용할 기준 날짜
     * @throws AiRateLimitException 날짜별 또는 일별 제한 초과 시
     */
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

    /**
     * [목적] AI 기능 사용 내역을 데이터베이스에 기록한다.
     * [설명] 사용 횟수 집계의 기준이 되는 레코드를 저장하여 이후 제한 초과 검사에 사용된다.
     *
     * @param member     AI를 사용한 회원 엔티티
     * @param targetDate AI 분석 대상 날짜
     * @param usageType  사용 유형 (ANALYZE, DAILY, INVENTORY)
     */
    private void recordUsage(Member member, LocalDate targetDate, String usageType) {
        aiDiaryUsageRepository.save(AiDiaryUsage.builder()
                .member(member).targetDate(targetDate)
                .calledAt(LocalDateTime.now()).usageType(usageType)
                .build());
    }

    /**
     * [목적] 이미지 파일에서 EXIF 메타데이터(촬영 일시, GPS 좌표)를 추출한다.
     * [설명] metadata-extractor 라이브러리를 사용하며, EXIF가 없거나 파싱 오류 시 null 값으로 반환한다.
     *
     * @param file EXIF를 추출할 이미지 파일
     * @return 촬영 일시, 위도, 경도를 담은 ExifMeta 레코드 (값 없으면 각 필드 null)
     */
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

    /**
     * [목적] 반려동물 목록의 특성 정보를 AI 프롬프트용 텍스트로 변환한다.
     * [설명] 이름, 품종, 성격, 외모, 좋아하는 것, 싫어하는 것, 일기 말투를 한 줄씩 포맷하여
     *        Gemini가 반려동물의 개성을 일지에 반영할 수 있도록 한다.
     *
     * @param pets 프롬프트에 포함할 반려동물 목록
     * @return 반려동물 특성 설명 텍스트 (비어 있으면 "알 수 없음")
     */
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

    /**
     * [목적] Gemini에 전달할 이미지 분석 프롬프트를 생성한다.
     * [설명] 날짜, 반려동물 정보, 사용자 개인 맥락, GPS 좌표, 사용자 키워드를 조합하여
     *        반려동물 1인칭 일지 형식의 JSON 응답을 요구하는 프롬프트를 반환한다.
     *
     * @param targetDate     분석 대상 날짜 (문자열)
     * @param petContext     반려동물 특성 설명 텍스트
     * @param userAiContext  사용자가 설정한 개인 AI 맥락 (null 가능)
     * @param imageFileNames 업로드된 이미지 파일명 목록
     * @param storedFiles    임시 저장된 파일 정보 (GPS 좌표 포함)
     * @param userTags       사용자가 직접 입력한 키워드 목록 (null 가능)
     * @return Gemini에 전달할 완성된 프롬프트 문자열
     */
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

    /**
     * [목적] Gemini가 반환한 JSON 문자열을 DailyLogResponse 객체로 파싱한다.
     * [설명] Jackson ObjectMapper를 사용하며, 파싱 실패 시 원본 텍스트를 aiSummary에 담아 반환한다.
     *
     * @param aiJson Gemini API가 반환한 JSON 형식의 문자열
     * @return 파싱된 DailyLogResponse (실패 시 기본값 응답)
     */
    private DailyLogResponse parseDailyLog(String aiJson) {
        try {
            return objectMapper.readValue(aiJson, DailyLogResponse.class);
        } catch (Exception e) {
            log.warn("AI 응답 파싱 실패: {}", aiJson, e);
            return DailyLogResponse.builder().aiTitle("AI 분석 완료").aiSummary(aiJson).moments(List.of()).build();
        }
    }

    /** 이미지 EXIF에서 추출한 촬영 정보를 담는 내부 레코드 */
    private record ExifMeta(LocalDateTime takenAt, Double latitude, Double longitude) {}
}
