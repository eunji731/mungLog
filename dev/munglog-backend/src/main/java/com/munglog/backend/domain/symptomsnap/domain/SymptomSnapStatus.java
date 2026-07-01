package com.munglog.backend.domain.symptomsnap.domain;

/**
 * 증상 스냅 처리 상태 열거형.
 * 증상 스냅이 현재 관찰 중인지, 진료를 통해 해결되었는지를 나타낸다.
 */
public enum SymptomSnapStatus {
    /** 관찰 중 - 아직 진료를 받지 않은 상태 */
    MONITORING,
    /** 해결됨 - 진료 기록과 연동 완료된 상태 */
    RESOLVED
}
