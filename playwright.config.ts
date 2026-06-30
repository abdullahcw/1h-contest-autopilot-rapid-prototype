import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './pw-tests',
  use: { headless: true, baseURL: 'http://localhost:4202', viewport: { width: 1280, height: 900 } },
  timeout: 30000,
});
