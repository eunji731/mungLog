package com.munglog.backend.common.file.service;

import com.munglog.backend.common.file.domain.ParentDomainType;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

/**
 * 파일 저장소 추상화 인터페이스.
 * 로컬 파일 시스템(LocalFileStorageService)과 AWS S3(S3FileStorageService) 구현체가 존재하며,
 * application.yml의 app.storage.type 설정으로 구현체를 선택한다.
 */
public interface FileStorageService {

    /**
     * [목적] MultipartFile을 지정된 도메인 경로에 저장하고 저장 경로를 반환한다.
     *
     * @param file       저장할 업로드 파일
     * @param parentType 파일이 속할 도메인 타입 (경로 구성에 사용)
     * @param parentId   파일이 속할 부모 엔티티 UUID (경로 구성에 사용)
     * @return 저장된 파일의 상대 경로(로컬) 또는 S3 키
     */
    String store(MultipartFile file, ParentDomainType parentType, UUID parentId);

    /**
     * [목적] InputStream으로부터 파일을 저장하고 저장 경로를 반환한다.
     * [설명] AI 처리 결과 등 MultipartFile이 아닌 스트림 형태의 파일을 저장할 때 사용한다.
     *
     * @param inputStream 저장할 파일 스트림
     * @param fileName    원본 파일명 (확장자 추출에 사용)
     * @param contentType MIME 타입 (예: image/jpeg)
     * @param parentType  도메인 타입
     * @param parentId    부모 엔티티 UUID
     * @return 저장된 파일의 상대 경로(로컬) 또는 S3 키
     */
    String storeFromStream(InputStream inputStream, String fileName, String contentType,
                           ParentDomainType parentType, UUID parentId);

    /**
     * [목적] 저장된 파일을 경로를 이용해 삭제한다.
     *
     * @param storedPath 삭제할 파일의 상대 경로(로컬) 또는 S3 키
     */
    void delete(String storedPath);

    /**
     * [목적] DB에 없는 고아 파일을 스토리지에서 정리한다.
     * [설명] DB에 등록된 storedPath 전체 목록을 받아 스토리지에만 존재하는 파일을 삭제한다.
     *
     * @param allStoredPaths DB에 등록된 모든 storedPath 목록
     */
    void deleteOrphans(List<String> allStoredPaths);

    /**
     * [목적] 저장된 파일을 읽기 위한 InputStream을 반환한다.
     *
     * @param storedPath 읽을 파일의 상대 경로(로컬) 또는 S3 키
     * @return 파일 InputStream
     */
    InputStream getInputStream(String storedPath);

    /**
     * [목적] 클라이언트가 파일에 접근할 수 있는 URL을 반환한다.
     * [설명] 로컬이면 /files/{path}, S3이면 https://{bucket}.s3.{region}.amazonaws.com/{key}
     *
     * @param storedPath 파일의 상대 경로 또는 S3 키
     * @return 공개 접근 가능한 URL 문자열
     */
    String getFileUrl(String storedPath);

    /**
     * [목적] 지정된 크기로 썸네일을 생성하고 저장한 후 경로를 반환한다.
     *
     * @param storedPath 원본 파일의 경로 또는 S3 키
     * @param size       썸네일의 가로/세로 픽셀 크기 (정방형)
     * @return 생성된 썸네일 경로 (실패 시 null)
     */
    String storeThumbnail(String storedPath, int size);
}
