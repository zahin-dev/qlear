export interface ScheduleItem {
  estimatedMinutes: number;
  priority: number;
}

export function buildSchedule(
  items: ScheduleItem[],
  options: { startDate?: Date; targetDate?: string; availableMinutesPerDay?: number },
): string[] {
  const cursor = new Date(options.startDate ?? new Date());
  cursor.setHours(12, 0, 0, 0);
  const target = options.targetDate ? new Date(`${options.targetDate}T23:59:59`) : undefined;
  const dailyBudget = options.availableMinutesPerDay ?? 45;
  let remaining = dailyBudget;

  return items.map((item) => {
    if (item.estimatedMinutes > remaining && remaining !== dailyBudget) {
      cursor.setDate(cursor.getDate() + 1);
      remaining = dailyBudget;
    }
    if (target && cursor > target) cursor.setTime(target.getTime());
    const scheduled = cursor.toISOString().slice(0, 10);
    remaining -= Math.min(item.estimatedMinutes, dailyBudget);
    if (remaining <= 0 || item.priority <= 2) {
      cursor.setDate(cursor.getDate() + 1);
      remaining = dailyBudget;
    }
    return scheduled;
  });
}
