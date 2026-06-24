package com.munglog.backend.common.domain.code;

import com.munglog.backend.common.id.IdGenerator;
import com.munglog.backend.common.id.IdPrefix;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class CodeService {

    private final CodeRepository codeRepository;
    private final IdGenerator idGenerator;

    @Transactional
    public Code create(String code, String name, CodeType type, Integer sortOrder) {
        String codeId = idGenerator.generate(IdPrefix.CODE);
        return codeRepository.save(Code.builder()
                .codeId(codeId)
                .code(code)
                .name(name)
                .type(type)
                .sortOrder(sortOrder)
                .build());
    }

    public List<Code> findByType(CodeType type) {
        return codeRepository.findByTypeAndUseYnOrderBySortOrder(type, "Y");
    }

    public Code findByCode(String code) {
        return codeRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("코드를 찾을 수 없습니다: " + code));
    }
}
