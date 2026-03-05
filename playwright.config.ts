import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E测试配置
 * 用于测试关键用户旅程和交互流程
 */
export default defineConfig({
  testDir: './e2e',
  
  // 测试超时设置
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },

  // 并发设置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // 报告配置
  reporter: [
    ['html'],
    ['list'],
  ],

  // 共享配置
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // 测试项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // 开发服务器配置
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
