package com.munglog.backend.domain.memory.repository;

import com.munglog.backend.domain.memory.domain.MemoryDog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MemoryDogRepository extends JpaRepository<MemoryDog, UUID> {
}
