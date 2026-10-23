import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  use: {
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    baseURL: "http://localhost:3107",
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: "pnpm dev --port 3107",
    url: "http://localhost:3107/demo",
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    env: { NEXT_PUBLIC_DEMO_MODE: "true", NEXT_TELEMETRY_DISABLED: "1" },
  },
});
