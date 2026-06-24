package com.munglog.backend.domain.care.repository;

import com.munglog.backend.domain.care.domain.ExpenseDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ExpenseDetailRepository extends JpaRepository<ExpenseDetail, UUID> {
}
