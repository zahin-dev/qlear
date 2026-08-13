import { describe, expect, it } from "vitest";
import { buildSchedule } from "@/shared/domain/scheduling/schedule";

describe("buildSchedule", () => {
  it("deterministically packs work into daily time", () => {
    const result = buildSchedule(
      [{ estimatedMinutes: 20, priority: 5 }, { estimatedMinutes: 30, priority: 4 }, { estimatedMinutes: 20, priority: 3 }],
      { startDate: new Date("2026-08-11T12:00:00Z"), availableMinutesPerDay: 45 },
    );
    expect(result).toEqual(["2026-08-11", "2026-08-12", "2026-08-13"]);
  });

  it("never schedules after the target date", () => {
    const result = buildSchedule(
      Array.from({ length: 4 }, () => ({ estimatedMinutes: 60, priority: 4 })),
      { startDate: new Date("2026-08-11T12:00:00Z"), targetDate: "2026-08-12", availableMinutesPerDay: 30 },
    );
    expect(result.at(-1)).toBe("2026-08-12");
  });
});
