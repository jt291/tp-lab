import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    projects: [
      // ✅ Tests Node
      {
        test: {
          name: "node",
          environment: "node",
          globals: true,
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.browser.test.ts"],
        },
      },
      // ✅ Tests Browser
      {
        test: {
          name: "browser",
          globals: true,
          include: ["src/**/*.browser.test.ts"],
          browser: {
            provider: playwright(),
            enabled: true,
            headless: true,
            instances: [
              { browser: "chromium" },
              { browser: "webkit" },
              { browser: "firefox" },
            ],
          },
        },
      },
    ],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules', 
        'dist', 
        'src/**/*.test.ts'
      ]
    }
  },
  
});