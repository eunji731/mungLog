package com.munglog.backend.domain.schedule.repository;

import com.munglog.backend.domain.schedule.domain.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScheduleRepository extends JpaRepository<Schedule, UUID> {

    @Query("SELECT s FROM Schedule s WHERE s.user.id = :userId AND s.pet.id = :petId ORDER BY s.scheduleDate ASC")
    List<Schedule> findByUserIdAndPetId(@Param("userId") UUID userId, @Param("petId") UUID petId);

    @Query("SELECT s FROM Schedule s WHERE s.user.id = :userId ORDER BY s.scheduleDate ASC")
    List<Schedule> findByUserId(@Param("userId") UUID userId);

    Optional<Schedule> findByIdAndUser_Id(UUID id, UUID userId);
}
