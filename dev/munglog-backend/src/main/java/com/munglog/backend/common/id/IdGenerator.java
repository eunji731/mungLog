package com.munglog.backend.common.id;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class IdGenerator {

    private final EntityManager em;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generate(String prefix) {
        Long seq = (Long) em.createNativeQuery(
                "SELECT nextval('tb_id_sequence')").getSingleResult();
        return String.format("%s%011d", prefix, seq);
    }
}
