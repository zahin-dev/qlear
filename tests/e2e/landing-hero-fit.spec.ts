import { expect, test, type Page } from "@playwright/test";

const VIEWPORTS = [
  { width: 1280, height: 630 },
  { width: 1366, height: 700 },
  { width: 1440, height: 900 },
  { width: 1440, height: 800 },
  { width: 1440, height: 760 },
  { width: 1600, height: 900 },
  { width: 1600, height: 800 },
  { width: 1920, height: 1080 },
  { width: 1920, height: 920 },
  { width: 1920, height: 900 },
  { width: 1920, height: 860 },
  { width: 1920, height: 850 },
] as const;

const HERO_SELECTORS = [
  ".hero__copy .system-label",
  ".hero__copy h1",
  ".hero__sub",
  ".hero__description",
  ".hero__actions a:first-child",
  ".hero__actions a:last-child",
  ".hero__status",
  ".command-preview",
  ".command-preview__chrome",
  ".command-preview__scan",
] as const;

function failOnConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test.describe("desktop Landing Hero viewport fit", () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}x${viewport.height} keeps the complete Hero in the first viewport`, async ({ page }) => {
      const errors = failOnConsole(page);
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);

      const header = page.locator(".landing-nav");
      const hero = page.locator(".hero");
      const preview = page.getByTestId("landing-preview");
      const previewTopLine = page.getByTestId("landing-preview-top-line");
      const previewBottomLine = page.getByTestId("landing-preview-bottom-line");
      await expect(header).toBeVisible();
      await expect(hero).toBeVisible();
      await expect(preview).toBeVisible();
      await expect(previewTopLine).toBeVisible();
      await expect(previewBottomLine).toBeVisible();

      const headerBox = await header.boundingBox();
      const heroBox = await hero.boundingBox();
      expect(headerBox).not.toBeNull();
      expect(heroBox).not.toBeNull();

      const headerBottom = (headerBox?.y ?? 0) + (headerBox?.height ?? 0);
      expect((heroBox?.y ?? 0)).toBeGreaterThanOrEqual(headerBottom - 2);
      expect((heroBox?.y ?? 0) + (heroBox?.height ?? 0)).toBeLessThanOrEqual(viewport.height + 2);

      for (const [name, element] of [
        ["preview outer box", preview],
        ["preview top line", previewTopLine],
        ["preview bottom line", previewBottomLine],
      ] as const) {
        const box = await element.boundingBox();
        expect(box, `${name} must have a bounding box`).not.toBeNull();
        expect(box?.y ?? -1, `${name} must start inside the viewport`).toBeGreaterThanOrEqual(0);
        expect((box?.y ?? 0) + (box?.height ?? 0), `${name} must end inside the viewport`).toBeLessThanOrEqual(viewport.height + 2);
      }

      for (const selector of HERO_SELECTORS) {
        const element = page.locator(selector);
        await expect(element).toBeVisible();
        const box = await element.boundingBox();
        expect(box, `${selector} must have a bounding box`).not.toBeNull();
        expect(box?.y ?? 0, `${selector} must start below the Header`).toBeGreaterThanOrEqual(headerBottom - 2);
        expect((box?.y ?? 0) + (box?.height ?? 0), `${selector} must end inside the viewport`).toBeLessThanOrEqual(viewport.height + 2);
        expect(box?.x ?? 0, `${selector} must not overflow left`).toBeGreaterThanOrEqual(-2);
        expect((box?.x ?? 0) + (box?.width ?? 0), `${selector} must not overflow right`).toBeLessThanOrEqual(viewport.width + 2);
      }

      const horizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(horizontalOverflow).toBe(0);
      expect(errors).toEqual([]);
    });
  }
});
