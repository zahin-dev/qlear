import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BossGauge } from "@/frontend/features/boss/components/boss-gauge";

describe("BossGauge", () => {
  it("exposes readable HP progress", () => {
    const now = new Date().toISOString();
    render(<BossGauge boss={{ id: "b", goalId: "g", title: "PORTFOLIO RELEASE", scopeLevel: 3, maxHp: 300, currentHp: 186, createdAt: now, updatedAt: now }} />);
    expect(screen.getByRole("progressbar", { name: "Boss remaining HP" })).toHaveAttribute("aria-valuenow", "186");
    expect(screen.getByText("PORTFOLIO RELEASE")).toBeInTheDocument();
  });
});
