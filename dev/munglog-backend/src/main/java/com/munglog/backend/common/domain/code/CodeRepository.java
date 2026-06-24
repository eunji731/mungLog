package com.munglog.backend.common.domain.code;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CodeRepository extends JpaRepository<Code, String> {

    List<Code> findByTypeAndUseYnOrderBySortOrder(CodeType type, String useYn);

    Optional<Code> findByCode(String code);
}
