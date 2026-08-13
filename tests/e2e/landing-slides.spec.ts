import { expect, test, type Page } from "@playwright/test";

const REQUIRED_VIEWPORTS = [
  { width: 1440, height: 760 },
  { width: 1600, height: 800 },
  { width: 1920, height: 900 },
  { width: 1920, height: 1080 },
] as const;

function failOnConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function waitForSlide(page: Page, slide: number) {
  const deck = page.getByTestId("landing-content");
  await expect(deck).toHaveAttribute("data-active-slide", String(slide));
  await expect(deck).toHaveAttribute("data-transitioning", "false", { timeout: 2_000 });
}

test.describe("Landing vertical slide deck", () => {
  for (const viewport of REQUIRED_VIEWPORTS) {
    test(`${viewport.width}x${viewport.height} keeps every section to one desktop slide`, async ({ page }) => {
      const errors = failOnConsole(page);
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);

      const header = page.getByTestId("landing-header");
      const deck = page.getByTestId("landing-content");
      const slides = deck.locator(":scope > .landing-slide-track > [data-landing-slide]");

      await expect(header).toBeVisible();
      await expect(page.getByTestId("landing-header-line")).toHaveCount(0);
      await expect(slides).toHaveCount(5);
      await expect(deck).toHaveAttribute("data-active-slide", "0");
      expect(await header.evaluate((element) => getComputedStyle(element).position)).toBe("fixed");

      const headerBox = await header.boundingBox();
      const deckBox = await deck.boundingBox();
      expect(headerBox).not.toBeNull();
      expect(deckBox).not.toBeNull();
      expect(headerBox?.y).toBe(0);
      expect(deckBox?.y).toBeCloseTo(headerBox?.height ?? 0, 0);
      expect(deckBox?.height).toBeCloseTo(viewport.height - (headerBox?.height ?? 0), 0);

      const slideMetrics = await slides.evaluateAll((elements) => elements.map((element) => ({
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        overflowY: getComputedStyle(element).overflowY,
      })));
      for (const metric of slideMetrics) {
        expect(metric.clientHeight).toBeCloseTo(deckBox?.height ?? 0, 0);
        expect(metric.scrollHeight - metric.clientHeight).toBeLessThanOrEqual(1);
        expect(metric.overflowY).toBe("hidden");
      }

      const scrollState = await page.evaluate(() => ({
        htmlOverflow: getComputedStyle(document.documentElement).overflowY,
        bodyOverflow: getComputedStyle(document.body).overflowY,
        scrollTop: document.scrollingElement?.scrollTop ?? window.scrollY,
        hasDocumentRange: (document.scrollingElement?.scrollHeight ?? 0) > (document.scrollingElement?.clientHeight ?? 0),
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      expect(scrollState.htmlOverflow).toBe("hidden");
      expect(scrollState.bodyOverflow).toBe("hidden");
      expect(scrollState.scrollTop).toBe(0);
      expect(scrollState.hasDocumentRange).toBe(false);
      expect(scrollState.horizontalOverflow).toBe(0);
      expect(errors).toEqual([]);
    });
  }

  test("wheel and trackpad gestures move exactly one slide while transition input is locked", async ({ page }) => {
    const errors = failOnConsole(page);
    await page.setViewportSize({ width: 1440, height: 760 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveTitle("QLEAR");
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", /icon\.png/);

    const logo = page.locator(".logo").first();
    const logoImage = logo.locator(".logo__image");
    await expect(logoImage).toHaveAttribute("src", /^\/qlear-logo\.png(?:\?.*)?$/);
    expect(await logo.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      boxShadow: getComputedStyle(element).boxShadow,
      filter: getComputedStyle(element).filter,
      outline: getComputedStyle(element).outlineStyle,
    }))).toEqual({ background: "rgba(0, 0, 0, 0)", boxShadow: "none", filter: "none", outline: "none" });
    expect(await logoImage.evaluate((image: HTMLImageElement) => image.naturalWidth / image.naturalHeight)).toBe(1.5);
    await expect(page.getByRole("heading", { name: "クエストであなたの目標を攻略！" })).toBeVisible();

    await page.mouse.move(720, 400);
    await page.mouse.wheel(0, 500);
    await expect(page.getByTestId("landing-content")).toHaveAttribute("data-active-slide", "1");
    await expect(page.getByTestId("landing-content")).toHaveAttribute("data-transitioning", "true");
    expect(await page.locator(".landing-slide-deck__pixels").evaluate((element) => getComputedStyle(element).animationName)).toBe("landing-pixel-transition");
    await page.evaluate(() => {
      for (let event = 0; event < 8; event += 1) window.dispatchEvent(new WheelEvent("wheel", { deltaY: 500, cancelable: true }));
    });
    await expect(page.getByTestId("landing-content")).toHaveAttribute("data-active-slide", "1");
    await waitForSlide(page, 1);

    await page.mouse.wheel(0, 30);
    await page.evaluate(() => {
      for (let event = 0; event < 8; event += 1) window.dispatchEvent(new WheelEvent("wheel", { deltaY: 30, cancelable: true }));
    });
    await waitForSlide(page, 2);

    await page.mouse.wheel(0, -240);
    await waitForSlide(page, 1);
    expect(await page.evaluate(() => document.scrollingElement?.scrollTop ?? window.scrollY)).toBe(0);
    expect(errors).toEqual([]);
  });

  test("Arrow and Page keys move one slide, lock repeats, and in-page links keep working", async ({ page }) => {
    const errors = failOnConsole(page);
    await page.setViewportSize({ width: 1440, height: 760 });
    await page.goto("/");
    await expect(page.locator("[data-landing-slide]").first()).toHaveAttribute("aria-hidden", "false");

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("PageDown");
    await expect(page.getByTestId("landing-content")).toHaveAttribute("data-active-slide", "1");
    await waitForSlide(page, 1);

    await page.keyboard.press("PageDown");
    await waitForSlide(page, 2);
    await page.keyboard.press("PageUp");
    await waitForSlide(page, 1);
    await page.keyboard.press("ArrowUp");
    await waitForSlide(page, 0);

    await page.getByRole("link", { name: "仕組みを見る" }).click();
    await waitForSlide(page, 1);
    await expect(page).toHaveURL(/#how$/);
    await page.getByRole("link", { name: "CLEAR" }).click();
    await waitForSlide(page, 2);
    await expect(page).toHaveURL(/#clear$/);
    expect(errors).toEqual([]);
  });

  test("authenticated routes retain their normal page behavior", async ({ page }) => {
    const errors = failOnConsole(page);
    await page.goto("/dashboard");

    await expect(page.locator(".landing")).toHaveCount(0);
    await expect(page.getByTestId("landing-content")).toHaveCount(0);
    const state = await page.evaluate(() => ({
      htmlSnap: getComputedStyle(document.documentElement).scrollSnapType,
      bodySnap: getComputedStyle(document.body).scrollSnapType,
      htmlOverflow: getComputedStyle(document.documentElement).overflowY,
    }));
    expect(state.htmlSnap).toBe("none");
    expect(state.bodySnap).toBe("none");
    expect(state.htmlOverflow).not.toBe("hidden");
    expect(errors).toEqual([]);
  });
});
