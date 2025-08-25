// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* 每次测试的超时时间 */
  timeout: 30 * 1000,
  /* 测试运行器的超时时间 */
  expect: {
    timeout: 5000
  },
  /* 测试报告 */
  reporter: 'html',
  /* 共享设置 */
  use: {
    /* 基础URL */
    baseURL: 'http://localhost:5174',
    /* 自动截图 */
    screenshot: 'only-on-failure',
    /* 收集跟踪以便调试 */
    trace: 'on-first-retry',
  },
  /* 配置项目 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});