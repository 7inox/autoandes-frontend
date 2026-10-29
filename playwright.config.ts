import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/resultados.json' }]],
  use: {
    baseURL: 'http://localhost:4200', viewport: { width: 1440, height: 1000 },
    launchOptions: { executablePath: process.env['CHROME_PATH'] || 'C:/Program Files/Google/Chrome/Application/chrome.exe' },
    trace: 'off', screenshot: 'only-on-failure',
  },
});
