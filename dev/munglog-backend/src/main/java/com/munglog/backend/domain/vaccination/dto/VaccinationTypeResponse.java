package com.munglog.backend.domain.vaccination.dto;

import com.munglog.backend.domain.vaccination.domain.VaccinationType;
import lombok.Builder;

/**
 * 예방접종 종류 응답 DTO.
 * 접종 종류 정보를 API 응답으로 전달하는 record 클래스.
 * isGlobal이 true이면 전역(관리자 제공) 접종 종류이다.
 *
 * @param id           접종 종류 ID
 * @param name         접종 종류명
 * @param intervalDays 접종 권장 주기 (일 단위)
 * @param isActive     활성 여부
 * @param isGlobal     전역 여부 (group == null이면 true)
 * @param groupName    소유 그룹명 (전역이면 null)
 */
@Builder
public record VaccinationTypeResponse(
        Long id,
        String name,
        Integer intervalDays,
        boolean isActive,
        boolean isGlobal,
        String groupName
) {
    /**
     * [목적] VaccinationType 엔티티를 응답 DTO로 변환한다.
     *
     * @param v 변환할 접종 종류 엔티티
     * @return 접종 종류 응답 DTO
     */
    public static VaccinationTypeResponse from(VaccinationType v) {
        return VaccinationTypeResponse.builder()
                .id(v.getId())
                .name(v.getName())
                .intervalDays(v.getIntervalDays())
                .isActive(v.getIsActive())
                .isGlobal(v.getGroup() == null)
                .groupName(v.getGroup() != null ? v.getGroup().getName() : null)
                .build();
    }
}
