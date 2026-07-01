package com.munglog.backend.domain.care.repository;

import com.munglog.backend.domain.care.domain.CareRecord;
import com.munglog.backend.domain.care.domain.CareRecordType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 케어 기록 레포지토리.
 * 그룹·반려동물·키워드 조건으로 케어 기록을 조회하고,
 * 그룹 데이터 삭제 시 벌크 삭제를 지원하는 JPA 레포지토리 인터페이스.
 */
public interface CareRecordRepository extends JpaRepository<CareRecord, UUID> {

    /**
     * [목적] 그룹·반려동물·키워드로 케어 기록을 조회한다.
     *
     * @param groupId 가족 그룹 UUID
     * @param petId   반려동물 UUID
     * @param keyword 제목 또는 메모 검색 키워드
     * @return 날짜 내림차순 정렬된 케어 기록 목록
     */
    @Query("SELECT c FROM CareRecord c WHERE c.pet.group.id = :groupId AND c.pet.id = :petId AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.note) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY c.recordDate DESC")
    List<CareRecord> findByGroupIdAndPetIdAndKeyword(@Param("groupId") UUID groupId, @Param("petId") UUID petId, @Param("keyword") String keyword);

    /**
     * [목적] 그룹·키워드로 케어 기록을 조회한다 (반려동물 무관).
     *
     * @param groupId 가족 그룹 UUID
     * @param keyword 제목 또는 메모 검색 키워드
     * @return 날짜 내림차순 정렬된 케어 기록 목록
     */
    @Query("SELECT c FROM CareRecord c WHERE c.pet.group.id = :groupId AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.note) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY c.recordDate DESC")
    List<CareRecord> findByGroupIdAndKeyword(@Param("groupId") UUID groupId, @Param("keyword") String keyword);

    /**
     * [목적] 그룹·반려동물 조건으로 케어 기록 전체를 조회한다.
     *
     * @param groupId 가족 그룹 UUID
     * @param petId   반려동물 UUID
     * @return 날짜 내림차순 정렬된 케어 기록 목록
     */
    @Query("SELECT c FROM CareRecord c WHERE c.pet.group.id = :groupId AND c.pet.id = :petId ORDER BY c.recordDate DESC")
    List<CareRecord> findByGroupIdAndPetId(@Param("groupId") UUID groupId, @Param("petId") UUID petId);

    /**
     * [목적] 그룹 내 모든 케어 기록을 조회한다.
     *
     * @param groupId 가족 그룹 UUID
     * @return 날짜 내림차순 정렬된 케어 기록 목록
     */
    @Query("SELECT c FROM CareRecord c WHERE c.pet.group.id = :groupId ORDER BY c.recordDate DESC")
    List<CareRecord> findByGroupId(@Param("groupId") UUID groupId);

    /**
     * [목적] 케어 기록 ID와 그룹 ID로 단건을 조회한다 (권한 검증 포함).
     *
     * @param id      케어 기록 UUID
     * @param groupId 가족 그룹 UUID
     * @return 케어 기록 Optional
     */
    @Query("SELECT c FROM CareRecord c WHERE c.id = :id AND c.pet.group.id = :groupId")
    Optional<CareRecord> findByIdAndGroupId(@Param("id") UUID id, @Param("groupId") UUID groupId);

    /**
     * [목적] 원본 스케줄 ID로 케어 기록을 조회한다.
     * [설명] 스케줄 완료 처리 시 중복 생성을 방지하거나 기존 기록을 참조할 때 사용한다.
     *
     * @param sourceScheduleId 원본 스케줄 UUID
     * @return 케어 기록 Optional
     */
    Optional<CareRecord> findBySourceScheduleId(UUID sourceScheduleId);

    /**
     * [목적] 지출 기록 연동에 사용할 병원 기록 후보를 조회한다.
     * [설명] 특정 반려동물의 지정 날짜 이후 HOSPITAL 타입 기록을 반환한다.
     *
     * @param groupId    가족 그룹 UUID
     * @param petId      반려동물 UUID
     * @param recordType 케어 유형 (HOSPITAL)
     * @param from       조회 시작 날짜
     * @return 날짜 내림차순 정렬된 병원 기록 목록
     */
    @Query("SELECT c FROM CareRecord c WHERE c.pet.group.id = :groupId AND c.pet.id = :petId AND c.recordType = :recordType AND c.recordDate >= :from ORDER BY c.recordDate DESC")
    List<CareRecord> findMedicalCandidates(@Param("groupId") UUID groupId, @Param("petId") UUID petId,
                                            @Param("recordType") CareRecordType recordType,
                                            @Param("from") LocalDate from);

    /**
     * [목적] 예방접종 종류 ID로 케어 기록 목록을 조회한다.
     * [설명] 예방접종 종류 병합 시 기존 기록에 연결된 종류를 재매핑할 때 사용한다.
     *
     * @param vaccinationTypeId 예방접종 종류 ID
     * @return 해당 예방접종 종류가 연결된 케어 기록 목록
     */
    List<CareRecord> findByVaccinationTypeId(Long vaccinationTypeId);

    /**
     * [목적] 그룹 내 모든 케어 기록을 벌크 삭제한다.
     * [설명] 그룹 탈퇴·해체 시 관련 데이터를 일괄 제거할 때 사용한다.
     *
     * @param groupId 삭제할 가족 그룹 UUID
     */
    @Modifying
    @Query("DELETE FROM CareRecord c WHERE c.pet.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
