package com.munglog.backend.domain.category.service;

import com.munglog.backend.domain.category.domain.CareCategory;
import com.munglog.backend.domain.category.domain.ScheduleCategory;
import com.munglog.backend.domain.category.repository.CareCategoryRepository;
import com.munglog.backend.domain.category.repository.ScheduleCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class CategoryDataInitializer implements ApplicationRunner {

    private final CareCategoryRepository careCategoryRepository;
    private final ScheduleCategoryRepository scheduleCategoryRepository;

    record CareCategoryData(String code, String displayName, String icon, int sortOrder) {}
    record ScheduleCategoryData(String code, String displayName, String icon, int sortOrder) {}

    private static final List<CareCategoryData> CARE_CATEGORIES = List.of(
            new CareCategoryData("HOSPITAL",   "병원",   "🏥", 1),
            new CareCategoryData("VACCINATION","예방접종","💉", 2),
            new CareCategoryData("CHECKUP",    "정기검진","🩺", 3),
            new CareCategoryData("MEDICINE",   "투약",   "💊", 4),
            new CareCategoryData("GROOMING",   "미용",   "✂️", 5),
            new CareCategoryData("EXPENSE",    "지출",   "💰", 6),
            new CareCategoryData("ETC",        "기타",   "📋", 99)
    );

    private static final List<ScheduleCategoryData> SCHEDULE_CATEGORIES = List.of(
            new ScheduleCategoryData("HOSPITAL",   "병원예약",    "🏥", 1),
            new ScheduleCategoryData("VACCINATION","예방접종예약", "💉", 2),
            new ScheduleCategoryData("CHECKUP",    "정기검진",    "🩺", 3),
            new ScheduleCategoryData("MEDICINE",   "투약일정",    "💊", 4),
            new ScheduleCategoryData("GROOMING",   "미용예약",    "✂️", 5),
            new ScheduleCategoryData("ETC",        "기타",        "📋", 99)
    );

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        initCareCategories();
        initScheduleCategories();
    }

    private void initCareCategories() {
        long count = careCategoryRepository.count();
        if (count > 0) return;

        log.info("케어기록 카테고리 초기화 시작");
        for (CareCategoryData d : CARE_CATEGORIES) {
            careCategoryRepository.save(CareCategory.builder()
                    .code(d.code())
                    .displayName(d.displayName())
                    .icon(d.icon())
                    .sortOrder(d.sortOrder())
                    .isSystem(true)
                    .build());
        }
        log.info("케어기록 카테고리 초기화 완료: {}건", CARE_CATEGORIES.size());
    }

    private void initScheduleCategories() {
        long count = scheduleCategoryRepository.count();
        if (count > 0) return;

        log.info("일정 카테고리 초기화 시작");
        for (ScheduleCategoryData d : SCHEDULE_CATEGORIES) {
            scheduleCategoryRepository.save(ScheduleCategory.builder()
                    .code(d.code())
                    .displayName(d.displayName())
                    .icon(d.icon())
                    .sortOrder(d.sortOrder())
                    .isSystem(true)
                    .build());
        }
        log.info("일정 카테고리 초기화 완료: {}건", SCHEDULE_CATEGORIES.size());
    }
}
