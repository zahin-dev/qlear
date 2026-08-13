import { expect, test, type Page } from "@playwright/test";

function failOnConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("critical Goal to persisted CLEAR flow", async ({ page }) => {
  const errors = failOnConsole(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "クエストであなたの目標を攻略！" })).toBeVisible();
  await page.getByRole("link", { name: /目標を攻略する/ }).first().click();
  await page.getByPlaceholder("9月までにポートフォリオを完成させる").fill("個人Webサービスをリリースする");
  await page.getByRole("button", { name: /攻略プランを作る/ }).click();
  await expect(page.getByText("PLAN READY // EDITABLE")).toBeVisible();
  await expect(page.locator(".plan-quest")).toHaveCount(3);
  await page.getByRole("button", { name: /この作戦で始める/ }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByText("NEXT 3 QUESTS")).toBeVisible();
  await expect(page.getByTestId("quest-card")).toHaveCount(3);
  const hpBefore = await page.locator(".boss-gauge__numbers strong").first().textContent();
  await page.getByRole("button", { name: /SMASH/ }).first().click();
  await expect(page.getByRole("heading", { name: "SMASH MODE" })).toBeVisible();
  await page.locator(".clear-button").click();
  await expect(page.locator(".crumple-stage")).toBeVisible();
  await expect(page.getByText("QUEST CLEAR")).toBeVisible();
  await expect(page.getByText(/DAMAGE/).last()).toBeVisible();
  await page.getByRole("button", { name: /NEXT QUEST/ }).click();
  await page.getByRole("link", { name: /REVIEW/ }).click();
  await expect(page.getByText("COMPLETION HISTORY")).toBeVisible();
  await expect(page.getByText("FIRST STEP")).toBeVisible();
  await page.reload();
  await expect(page.locator(".history-list article")).toHaveCount(1);
  await page.getByRole("link", { name: /COMMAND/ }).click();
  await expect(page.locator(".boss-gauge__numbers strong").first()).not.toHaveText(hpBefore ?? "");
  expect(errors).toEqual([]);
});

test("alternative, replan, and settings controls remain user-owned", async ({ page }) => {
  const errors = failOnConsole(page);
  await page.goto("/settings");
  await page.getByRole("button", { name: "LOAD DEMO" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.getByRole("link", { name: /QUEST BOARD/ }).click();
  await expect(page.getByRole("heading", { name: "QUEST BOARD" })).toBeVisible();
  await page.getByRole("link", { name: /COMMAND/ }).click();
  await page.getByRole("button", { name: "作戦を組み直す" }).click();
  await expect(page.getByRole("heading", { name: /REPLAN/ })).toBeVisible();
  await expect(page.locator(".plan-quest")).toHaveCount(3);
  await page.getByRole("button", { name: "新しい作戦を反映" }).click();
  await page.getByRole("link", { name: /SMASH/ }).click();
  await page.getByRole("button", { name: "別候補を見る" }).click();
  await expect(page.locator(".alternative-list button")).toHaveCount(3);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "別ルート", exact: true }).click();
  await expect(page.locator(".route-alternatives button")).toHaveCount(3);
  await page.locator(".route-alternatives button").first().click();
  await expect(page.getByRole("button", { name: "UNDO" })).toBeVisible();
  await page.getByRole("link", { name: /SETTINGS/ }).click();
  await expect(page.getByText("DATA // LOCAL FIRST")).toBeVisible();
  expect(errors).toEqual([]);
});
