package com.munglog.backend.domain.vaccination.repository;

import com.munglog.backend.domain.vaccination.domain.VaccinationAlias;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VaccinationAliasRepository extends JpaRepository<VaccinationAlias, Long> {

    Optional<VaccinationAlias> findByAliasIgnoreCase(String alias);

    @Query("""
            SELECT a FROM VaccinationAlias a
            WHERE LOWER(a.alias) LIKE LOWER(CONCAT('%', :keyword, '%'))
            """)
    List<VaccinationAlias> findByAliasContainingIgnoreCase(@Param("keyword") String keyword);

    List<VaccinationAlias> findByVaccinationTypeId(Long vaccinationTypeId);

    boolean existsByAlias(String alias);

    @Modifying
    @Query("DELETE FROM VaccinationAlias va WHERE va.vaccinationType.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
