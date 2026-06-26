import type { CareRecord } from '@/types/care';

export const formatAmount = (v: number) =>
  v >= 10000 ? `${(v / 10000).toFixed(v % 10000 === 0 ? 0 : 1)}만원` : `${v.toLocaleString()}원`;

const EXPENSE_CAT_LABELS: Record<string, string> = {
  HOSPITAL: '병원비',
  MEDICINE: '약/영양제',
  GROOMING: '미용',
  FOOD:     '사료/간식',
  SUPPLIES: '용품',
  ETC:      '기타',
};

function categorizeRecord(r: CareRecord): string {
  if (r.recordType === 'EXPENSE') return r.categoryCode || 'ETC';
  if (r.recordType === 'HOSPITAL' || r.recordType === 'CHECKUP' || r.recordType === 'VACCINATION') return 'HOSPITAL';
  if (r.recordType === 'MEDICINE') return 'MEDICINE';
  if (r.recordType === 'GROOMING') return 'GROOMING';
  return 'ETC';
}

export function buildExpenseData(records: CareRecord[], startDate: string, endDate: string) {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T23:59:59');
  start.setDate(1);

  const points: { month: string; total: number }[] = [];
  const d = new Date(start);
  while (d <= end) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    points.push({
      month: `${d.getFullYear() !== new Date().getFullYear() ? d.getFullYear() + '/' : ''}${d.getMonth() + 1}월`,
      total: records
        .filter(r => r.recordDate?.startsWith(key) && r.amount && r.amount > 0)
        .reduce((sum, r) => sum + (r.amount ?? 0), 0),
    });
    d.setMonth(d.getMonth() + 1);
  }
  return points;
}

export function buildCategoryStats(records: CareRecord[], startDate: string, endDate: string) {
  const filtered = records.filter(r =>
    r.recordDate >= startDate && r.recordDate <= endDate && r.amount && r.amount > 0
  );
  const totals: Record<string, number> = {};
  for (const r of filtered) {
    const c = categorizeRecord(r);
    totals[c] = (totals[c] || 0) + (r.amount ?? 0);
  }
  return Object.entries(totals)
    .map(([code, total]) => ({ code, label: EXPENSE_CAT_LABELS[code] ?? code, total }))
    .sort((a, b) => b.total - a.total);
}
