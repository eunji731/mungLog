package com.munglog.backend.domain.vaccination.repository;

import com.munglog.backend.domain.vaccination.domain.VaccinationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface VaccinationTypeRepository extends JpaRepository<VaccinationType, Long> {

    @Query("""
            SELECT v FROM VaccinationType v
            WHERE (v.member IS NULL OR v.member.id = :memberId)
            AND v.isActive = true
            ORDER BY v.member NULLS FIRST, v.name
            """)
    List<VaccinationType> findActiveByMember(@Param("memberId") UUID memberId);

    @Query("""
            SELECT v FROM VaccinationType v
            WHERE (v.member IS NULL OR v.member.id = :memberId)
            ORDER BY v.member NULLS FIRST, v.name
            """)
    List<VaccinationType> findAllByMember(@Param("memberId") UUID memberId);
}
