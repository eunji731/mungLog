package com.munglog.backend.common.id;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * DB 시퀀스 기반 고유 ID를 생성하는 컴포넌트 클래스.
 * PostgreSQL의 tb_id_sequence 시퀀스를 사용하여 순차적으로 증가하는 숫자에
 * 접두사(prefix)를 붙인 11자리 ID를 생성한다.
 * 예: IdPrefix.CODE + 1 → "COD00000000001"
 */
@Component
@RequiredArgsConstructor
public class IdGenerator {

    private final EntityManager em;

    /**
     * [목적] DB 시퀀스로 고유 ID를 생성한다.
     * [설명] REQUIRES_NEW 전파 옵션을 사용하여 호출 트랜잭션과 독립적으로 시퀀스를 채번한다.
     *        이렇게 하면 외부 트랜잭션이 롤백되어도 시퀀스 번호는 소진된다(갭 허용).
     *        생성 형식: {prefix}{11자리 숫자} (총 길이 prefix + 11)
     *
     * @param prefix ID 접두사 (예: "COD", "USR", "PET")
     * @return 생성된 고유 ID 문자열 (예: "COD00000000001")
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generate(String prefix) {
        Long seq = (Long) em.createNativeQuery(
                "SELECT nextval('tb_id_sequence')").getSingleResult();
        return String.format("%s%011d", prefix, seq);
    }
}
