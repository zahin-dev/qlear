import { defineConfig, devices } from "@playwright/test";

const externalBaseURL = process.env.QLEAR_E2E_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: externalBaseURL ? undefined : "./tests/e2e/global-setup.ts",
  fullyParallel: false,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: externalBaseURL ?? "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
