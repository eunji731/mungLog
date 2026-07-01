package com.munglog.backend.common.file.service;

import com.munglog.backend.common.file.domain.ParentDomainType;
import com.munglog.backend.common.file.exception.FileStorageException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import net.coobird.thumbnailator.Thumbnails;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;

/**
 * AWS S3를 사용하는 파일 저장 서비스 구현체.
 * application.yml에서 app.storage.type=s3로 설정 시 활성화된다.
 * 파일은 S3 버킷의 files/{parentType}/{parentId}/{uuid}.{ext} 키 경로에 저장된다.
 * S3Config에서 등록된 S3Client 빈을 사용하여 AWS에 인증한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
public class S3FileStorageService implements FileStorageService {

    private final S3Client s3Client;

    /** S3 버킷 이름 */
    @Value("${app.s3.bucket}")
    private String bucket;

    /** S3 버킷 리전 (URL 생성에 사용) */
    @Value("${app.s3.region}")
    private String region;

    /**
     * [목적] MultipartFile을 S3에 업로드한다.
     *
     * @param file       업로드할 파일
     * @param parentType 도메인 타입 (S3 키 경로 구성에 사용)
     * @param parentId   부모 엔티티 UUID
     * @return S3 객체 키 (storedPath로 DB에 저장됨)
     * @throws FileStorageException S3 업로드 실패 시
     */
    @Override
    public String store(MultipartFile file, ParentDomainType parentType, UUID parentId) {
        try {
            String key = buildKey(parentType, parentId, getExtension(file.getOriginalFilename()));
            s3Client.putObject(PutObjectRequest.builder()
                            .bucket(bucket).key(key).contentType(file.getContentType()).build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return key;
        } catch (IOException e) {
            throw new FileStorageException("S3 업로드 실패", e);
        }
    }

    /**
     * [목적] InputStream으로부터 데이터를 S3에 업로드한다.
     * [설명] InputStream을 byte 배열로 읽어 S3에 업로드한다.
     *        대용량 파일의 경우 메모리 사용에 주의가 필요하다.
     *
     * @param inputStream 업로드할 데이터 스트림
     * @param fileName    원본 파일명 (확장자 추출용)
     * @param contentType MIME 타입
     * @param parentType  도메인 타입
     * @param parentId    부모 엔티티 UUID
     * @return S3 객체 키
     * @throws FileStorageException 업로드 실패 시
     */
    @Override
    public String storeFromStream(InputStream inputStream, String fileName, String contentType,
                                   ParentDomainType parentType, UUID parentId) {
        try {
            String key = buildKey(parentType, parentId, getExtension(fileName));
            byte[] bytes = inputStream.readAllBytes();
            s3Client.putObject(PutObjectRequest.builder()
                            .bucket(bucket).key(key).contentType(contentType).build(),
                    RequestBody.fromBytes(bytes));
            return key;
        } catch (IOException e) {
            throw new FileStorageException("S3 스트림 업로드 실패", e);
        }
    }

    /**
     * [목적] S3에서 파일을 삭제한다.
     * [설명] 삭제 실패 시 예외를 던지지 않고 경고 로그만 남긴다.
     *
     * @param storedPath 삭제할 S3 객체 키
     */
    @Override
    public void delete(String storedPath) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(storedPath).build());
        } catch (Exception e) {
            log.warn("S3 삭제 실패: {}", storedPath, e);
        }
    }

    /**
     * [목적] 고아 파일 정리 (S3 환경에서는 미구현).
     *
     * @param allStoredPaths DB에 등록된 모든 키 목록
     */
    @Override
    public void deleteOrphans(List<String> allStoredPaths) {
        // 구현 생략
    }

    /**
     * [목적] S3에서 파일 데이터를 읽기 위한 InputStream을 반환한다.
     *
     * @param storedPath S3 객체 키
     * @return S3 객체 InputStream
     */
    @Override
    public InputStream getInputStream(String storedPath) {
        return s3Client.getObject(GetObjectRequest.builder().bucket(bucket).key(storedPath).build());
    }

    /**
     * [목적] S3 파일의 공개 접근 URL을 생성한다.
     * [설명] https://{bucket}.s3.{region}.amazonaws.com/{key} 형식을 사용한다.
     *        버킷이 공개 접근을 허용해야 URL로 파일을 직접 조회할 수 있다.
     *
     * @param storedPath S3 객체 키
     * @return S3 파일 공개 URL (null이면 null 반환)
     */
    @Override
    public String getFileUrl(String storedPath) {
        if (storedPath == null) return null;
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + storedPath;
    }

    /**
     * [목적] S3에서 원본 이미지를 가져와 썸네일을 생성하고 다시 S3에 업로드한다.
     * [설명] Thumbnailator로 리사이징 후 JPEG 형식으로 S3에 재업로드한다.
     *        썸네일 키는 원본과 같은 경로에 "thumb{size}_" 접두사를 붙인다.
     *
     * @param storedPath 원본 파일의 S3 키
     * @param size       썸네일 픽셀 크기 (정방형 기준)
     * @return 생성된 썸네일의 S3 키 (실패 시 null)
     */
    @Override
    public String storeThumbnail(String storedPath, int size) {
        try (InputStream inputStream = getInputStream(storedPath);
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            int lastSlash = storedPath.lastIndexOf('/');
            String dir = lastSlash >= 0 ? storedPath.substring(0, lastSlash) : "";
            String filename = lastSlash >= 0 ? storedPath.substring(lastSlash + 1) : storedPath;
            String thumbKey = (dir.isEmpty() ? "" : dir + "/") + "thumb" + size + "_" + filename;

            Thumbnails.of(inputStream)
                    .size(size, size)
                    .keepAspectRatio(true)
                    .outputFormat("jpg")
                    .toOutputStream(baos);

            byte[] bytes = baos.toByteArray();
            s3Client.putObject(PutObjectRequest.builder()
                            .bucket(bucket).key(thumbKey).contentType("image/jpeg").build(),
                    RequestBody.fromBytes(bytes));

            return thumbKey;
        } catch (Exception e) {
            log.warn("S3 썸네일 생성 실패 ({}px): {}", size, storedPath, e);
            return null;
        }
    }

    /**
     * [목적] 도메인 타입, 부모 ID, 확장자로 고유한 S3 키를 생성한다.
     * [설명] 예: files/pet_profile/550e8400.../a1b2c3d4.jpg
     *
     * @param parentType 도메인 타입
     * @param parentId   부모 엔티티 UUID
     * @param ext        파일 확장자
     * @return S3 객체 키 문자열
     */
    private String buildKey(ParentDomainType parentType, UUID parentId, String ext) {
        return "files/" + parentType.name().toLowerCase() + "/" + parentId + "/" + UUID.randomUUID() + ext;
    }

    /**
     * [목적] 파일명에서 확장자를 추출한다.
     *
     * @param filename 파일명 (null 허용)
     * @return 확장자 문자열 (예: ".jpg"), 없으면 빈 문자열
     */
    private String getExtension(String filename) {
        if (filename == null) return "";
        int idx = filename.lastIndexOf('.');
        return idx >= 0 ? filename.substring(idx) : "";
    }
}
