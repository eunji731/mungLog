export interface VaccinationType {
  id: number;
  name: string;
  intervalDays: number | null;
  isActive: boolean;
  isGlobal: boolean;
  groupName?: string | null;
}

export interface VaccinationAliasMatch {
  vaccinationTypeId: number;
  vaccinationTypeName: string;
  intervalDays: number | null;
  matchedAlias: string;
}

export interface VaccinationDDayInfo {
  lastDate: string;
  nextDueDate: string | null;
  dDay: number | null;
  status: 'OK' | 'SOON' | 'OVERDUE';
}

export interface VaccinationSummaryItem {
  vaccinationTypeId: number;
  vaccinationTypeName: string;
  intervalDays: number | null;
  lastRecordId: string;
  lastDate: string;
  dDayInfo: VaccinationDDayInfo | null;
}
