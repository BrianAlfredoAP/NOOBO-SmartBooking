export function toDateOnly(value: unknown): string {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String((value as string | number) ?? '').slice(0, 10);
}

export function normalizeTime(value: unknown): string {
  const raw = String((value as string | number) ?? '00:00');
  const match = /^(\d{1,2}):(\d{2})/.exec(raw);
  if (!match) return '00:00';
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

export function combineDateTime(dateValue: unknown, timeValue: unknown): Date {
  const dateStr = toDateOnly(dateValue);
  const date = new Date(`${dateStr}T${normalizeTime(timeValue)}:00`);
  return Number.isNaN(date.getTime()) ? new Date(dateStr) : date;
}
