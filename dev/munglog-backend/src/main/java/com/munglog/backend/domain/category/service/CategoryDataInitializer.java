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

/**
 * 카테고리 초기 데이터 설정 컴포넌트.
 * 애플리케이션 시작 시 DB에 케어 카테고리와 일정 카테고리 기본 데이터가 없으면 자동으로 삽입하는 클래스.
 * 주요 기능: 시스템 카테고리 초기화 (애플리케이션 최초 실행 시 1회만 동작)
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class CategoryDataInitializer implements ApplicationRunner {

    private final CareCategoryRepository careCategoryRepository;
    private final ScheduleCategoryRepository scheduleCategoryRepository;

    /** 케어 카테고리 초기 데이터 구조체 */
    record CareCategoryData(String code, String displayName, String icon, int sortOrder) {}

    /** 일정 카테고리 초기 데이터 구조체 */
    record ScheduleCategoryData(String code, String displayName, String icon, int sortOrder) {}

    /** 시스템 기본 케어 카테고리 목록 */
    private static final List<CareCategoryData> CARE_CATEGORIES = List.of(
            new CareCategoryData("HOSPITAL",   "병원",   "🏥", 1),
            new CareCategoryData("VACCINATION","예방접종","💉", 2),
            new CareCategoryData("CHECKUP",    "정기검진","🩺", 3),
            new CareCategoryData("MEDICINE",   "투약",   "💊", 4),
            new CareCategoryData("GROOMING",   "미용",   "✂️", 5),
            new CareCategoryData("EXPENSE",    "지출",   "💰", 6),
            new CareCategoryData("ETC",        "기타",   "📋", 99)
    );

    /** 시스템 기본 일정 카테고리 목록 */
    private static final List<ScheduleCategoryData> SCHEDULE_CATEGORIES = List.of(
            new ScheduleCategoryData("HOSPITAL",   "병원예약",    "🏥", 1),
            new ScheduleCategoryData("VACCINATION","예방접종예약", "💉", 2),
            new ScheduleCategoryData("CHECKUP",    "정기검진",    "🩺", 3),
            new ScheduleCategoryData("MEDICINE",   "투약일정",    "💊", 4),
            new ScheduleCategoryData("GROOMING",   "미용예약",    "✂️", 5),
            new ScheduleCategoryData("ETC",        "기타",        "📋", 99)
    );

    /**
     * [목적] 애플리케이션 시작 시 카테고리 초기 데이터를 삽입한다.
     * [설명] ApplicationRunner를 구현하여 스프링 부트 시작 완료 후 자동 실행된다.
     *        케어 카테고리와 일정 카테고리 각각 데이터가 없을 때만 삽입한다.
     *
     * @param args 애플리케이션 실행 인자 (사용하지 않음)
     */
    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        initCareCategories();
        initScheduleCategories();
    }

    /**
     * [목적] 케어 카테고리 기본 데이터를 DB에 삽입한다.
     * [설명] 이미 데이터가 존재하면 아무것도 하지 않는다 (멱등성 보장).
     */
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

    /**
     * [목적] 일정 카테고리 기본 데이터를 DB에 삽입한다.
     * [설명] 이미 데이터가 존재하면 아무것도 하지 않는다 (멱등성 보장).
     */
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
