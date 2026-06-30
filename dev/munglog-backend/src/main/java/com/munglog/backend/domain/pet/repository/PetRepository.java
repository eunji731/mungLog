package com.munglog.backend.domain.pet.repository;

import com.munglog.backend.domain.pet.domain.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PetRepository extends JpaRepository<Pet, UUID> {
    List<Pet> findByGroupIdAndIsActiveTrue(UUID groupId);
    List<Pet> findByGroupId(UUID groupId);
    Optional<Pet> findByIdAndGroupId(UUID id, UUID groupId);
}
