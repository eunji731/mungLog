package com.munglog.backend.common.domain.code;

import com.munglog.backend.common.id.IdGenerator;
import com.munglog.backend.common.id.IdPrefix;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 공통 코드 비즈니스 로직을 담당하는 서비스 클래스.
 * 코드 생성, 타입별 조회, 코드값 조회 기능을 제공한다.
 * 기본 트랜잭션은 읽기 전용(readOnly=true)으로 설정하여 성능을 최적화한다.
 */
@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class CodeService {

    private final CodeRepository codeRepository;
    private final IdGenerator idGenerator;

    /**
     * [목적] 새 공통 코드를 생성하고 DB에 저장한다.
     * [설명] 코드 ID는 IdGenerator를 통해 "COD" 접두사가 붙은 시퀀스 값으로 생성된다.
     *
     * @param code      코드 값 (예: "ROLE_USER")
     * @param name      코드 표시명 (예: "일반 사용자")
     * @param type      코드 분류 타입
     * @param sortOrder 목록 정렬 순서
     * @return 저장된 Code 엔티티
     */
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

    /**
     * [목적] 특정 타입의 사용 중인 코드 목록을 조회한다.
     *
     * @param type 조회할 코드 타입
     * @return useYn="Y"인 코드 목록 (sortOrder 오름차순)
     */
    public List<Code> findByType(CodeType type) {
        return codeRepository.findByTypeAndUseYnOrderBySortOrder(type, "Y");
    }

    /**
     * [목적] 코드 값 문자열로 단건 Code를 조회한다.
     *
     * @param code 조회할 코드 값
     * @return 해당 코드 엔티티
     * @throws IllegalArgumentException 코드를 찾을 수 없는 경우
     */
    public Code findByCode(String code) {
        return codeRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("코드를 찾을 수 없습니다: " + code));
    }
}
