package com.munglog.backend.domain.vaccination.service;

import com.munglog.backend.domain.vaccination.domain.VaccinationAlias;
import com.munglog.backend.domain.vaccination.domain.VaccinationType;
import com.munglog.backend.domain.vaccination.repository.VaccinationAliasRepository;
import com.munglog.backend.domain.vaccination.repository.VaccinationTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class VaccinationTypeDataInitializer implements ApplicationRunner {

    private final VaccinationTypeRepository vaccinationTypeRepository;
    private final VaccinationAliasRepository vaccinationAliasRepository;

    // 전역 기본 접종 종류 (member = null)
    private static final List<Map<String, Object>> DEFAULT_TYPES = List.of(
            Map.of("name", "종합백신(DHPPL)", "intervalDays", 365,
                    "aliases", List.of("DHPPL", "종합백신", "5종백신", "DHPPi")),
            Map.of("name", "광견병", "intervalDays", 365,
                    "aliases", List.of("광견병주사", "광견병 예방접종", "Rabies", "광견병백신", "공수병")),
            Map.of("name", "켄넬코프", "intervalDays", 365,
                    "aliases", List.of("기관지염", "Bordetella", "켄넬코프백신")),
            Map.of("name", "인플루엔자", "intervalDays", 180,
                    "aliases", List.of("독감", "개독감", "Influenza", "인플루엔자백신")),
            Map.of("name", "코로나", "intervalDays", 365,
                    "aliases", List.of("코로나백신", "Corona")),
            Map.of("name", "심장사상충", "intervalDays", 30,
                    "aliases", List.of("심장사상충약", "심사", "Heartgard", "하트가드")),
            Map.of("name", "외부기생충", "intervalDays", 30,
                    "aliases", List.of("벼룩", "진드기", "벼룩진드기")),
            Map.of("name", "렙토스피라", "intervalDays", 365,
                    "aliases", List.of("렙토", "Leptospira"))
    );

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        long existingCount = vaccinationTypeRepository.count();
        if (existingCount > 0) {
            return; // 이미 초기화됨
        }

        log.info("기본 접종종류 데이터 초기화 시작");
        for (Map<String, Object> typeData : DEFAULT_TYPES) {
            VaccinationType vt = vaccinationTypeRepository.save(VaccinationType.builder()
                    .group(null)
                    .name((String) typeData.get("name"))
                    .intervalDays((Integer) typeData.get("intervalDays"))
                    .build());

            @SuppressWarnings("unchecked")
            List<String> aliases = (List<String>) typeData.get("aliases");
            for (String alias : aliases) {
                vaccinationAliasRepository.save(VaccinationAlias.builder()
                        .vaccinationType(vt)
                        .alias(alias)
                        .build());
            }
        }
        log.info("기본 접종종류 데이터 초기화 완료: {}건", DEFAULT_TYPES.size());
    }
}
