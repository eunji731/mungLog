package com.munglog.backend.domain.vaccination.repository;

import com.munglog.backend.domain.vaccination.domain.VaccinationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface VaccinationTypeRepository extends JpaRepository<VaccinationType, Long> {

    @Query("""
            SELECT v FROM VaccinationType v
            WHERE (v.group IS NULL OR v.group.id = :groupId)
            AND v.isActive = true
            ORDER BY v.group NULLS FIRST, v.name
            """)
    List<VaccinationType> findActiveByGroup(@Param("groupId") UUID groupId);

    @Query("""
            SELECT v FROM VaccinationType v
            WHERE (v.group IS NULL OR v.group.id = :groupId)
            ORDER BY v.group NULLS FIRST, v.name
            """)
    List<VaccinationType> findAllByGroup(@Param("groupId") UUID groupId);

    @Query("SELECT v FROM VaccinationType v WHERE v.group IS NOT NULL AND v.isActive = true ORDER BY v.name")
    List<VaccinationType> findAllUserCreated();

    @Modifying
    @Query("UPDATE VaccinationType v SET v.group.id = :targetGroupId WHERE v.group.id = :sourceGroupId")
    int bulkMoveToGroup(@Param("sourceGroupId") UUID sourceGroupId, @Param("targetGroupId") UUID targetGroupId);

    @Modifying
    @Query("DELETE FROM VaccinationType v WHERE v.group IS NOT NULL AND v.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
