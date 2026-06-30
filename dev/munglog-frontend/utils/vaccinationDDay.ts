import type { VaccinationDDayInfo, VaccinationSummaryItem } from '@/types/vaccination';
import type { CareRecord } from '@/types/care';

export function calcVaccinationDDay(
  lastDate: string,
  intervalDays: number | null
): VaccinationDDayInfo | null {
  if (!intervalDays) return null;

  const last = new Date(lastDate);
  if (isNaN(last.getTime())) return null;

  const nextDue = new Date(last);
  nextDue.setDate(nextDue.getDate() + intervalDays);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  nextDue.setHours(0, 0, 0, 0);

  const dDay = Math.floor((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let status: VaccinationDDayInfo['status'];
  if (dDay < 0) status = 'OVERDUE';
  else if (dDay <= 30) status = 'SOON';
  else status = 'OK';

  return {
    lastDate,
    nextDueDate: nextDue.toISOString().split('T')[0],
    dDay,
    status,
  };
}

export function buildVaccinationSummary(records: CareRecord[]): VaccinationSummaryItem[] {
  const grouped = new Map<number, CareRecord>();

  for (const record of records) {
    if (!record.vaccinationTypeId) continue;
    const existing = grouped.get(record.vaccinationTypeId);
    if (!existing || record.recordDate > existing.recordDate) {
      grouped.set(record.vaccinationTypeId, record);
    }
  }

  return Array.from(grouped.values()).map(record => ({
    vaccinationTypeId: record.vaccinationTypeId!,
    vaccinationTypeName: record.vaccinationTypeName || record.title,
    intervalDays: record.vaccinationIntervalDays ?? null,
    lastRecordId: record.id,
    lastDate: record.recordDate,
    dDayInfo: calcVaccinationDDay(record.recordDate, record.vaccinationIntervalDays ?? null),
  }));
}

export function formatDDay(dDay: number): string {
  if (dDay === 0) return 'D-Day';
  if (dDay > 0) return `D-${dDay}`;
  return `D+${Math.abs(dDay)}`;
}
