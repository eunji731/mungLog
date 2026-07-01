package com.munglog.backend.domain.schedule.repository;

import com.munglog.backend.domain.schedule.domain.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScheduleRepository extends JpaRepository<Schedule, UUID> {

    @Query("SELECT s FROM Schedule s WHERE s.pet.group.id = :groupId AND s.pet.id = :petId AND (LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.memo) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY s.scheduleDate ASC")
    List<Schedule> findByGroupIdAndPetIdAndKeyword(@Param("groupId") UUID groupId, @Param("petId") UUID petId, @Param("keyword") String keyword);

    @Query("SELECT s FROM Schedule s WHERE s.pet.group.id = :groupId AND (LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.memo) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY s.scheduleDate ASC")
    List<Schedule> findByGroupIdAndKeyword(@Param("groupId") UUID groupId, @Param("keyword") String keyword);

    @Query("SELECT s FROM Schedule s WHERE s.pet.group.id = :groupId AND s.pet.id = :petId ORDER BY s.scheduleDate ASC")
    List<Schedule> findByGroupIdAndPetId(@Param("groupId") UUID groupId, @Param("petId") UUID petId);

    @Query("SELECT s FROM Schedule s WHERE s.pet.group.id = :groupId ORDER BY s.scheduleDate ASC")
    List<Schedule> findByGroupId(@Param("groupId") UUID groupId);

    @Query("SELECT s FROM Schedule s WHERE s.id = :id AND s.pet.group.id = :groupId")
    Optional<Schedule> findByIdAndGroupId(@Param("id") UUID id, @Param("groupId") UUID groupId);

    @Modifying
    @Query("DELETE FROM Schedule s WHERE s.pet.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") UUID groupId);
}
