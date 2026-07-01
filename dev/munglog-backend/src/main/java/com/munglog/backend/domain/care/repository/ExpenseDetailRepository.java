package com.munglog.backend.domain.care.repository;

import com.munglog.backend.domain.care.domain.ExpenseDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ExpenseDetailRepository extends JpaRepository<ExpenseDetail, UUID> {

    @Modifying
    @Query("DELETE FROM ExpenseDetail ed WHERE ed.careRecord.pet.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
