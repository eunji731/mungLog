package com.munglog.backend.domain.care.repository;

import com.munglog.backend.domain.care.domain.MedicalDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface MedicalDetailRepository extends JpaRepository<MedicalDetail, UUID> {

    @Modifying
    @Query("DELETE FROM MedicalDetail md WHERE md.careRecord.pet.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
