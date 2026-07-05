import { expect, test, chromium, type BrowserContext } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const e2eDir = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.join(e2eDir, '../dist');
const manifestPath = path.join(extensionPath, 'manifest.json');
const fixturesDir = path.join(e2eDir, 'fixtures');

async function launchWithExtension(): Promise<BrowserContext> {
  return chromium.launchPersistentContext('', {
    headless: false,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });
}

async function extensionId(context: BrowserContext): Promise<string> {
  const serviceWorker =
    context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker', { timeout: 15_000 }));
  return new URL(serviceWorker.url()).host;
}

test.describe('extension harness', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(manifestPath)) {
      throw new Error('Run `npm run build` before Playwright e2e tests.');
    }
  });

  test('loads unpacked extension and side panel UI', async () => {
    const context = await launchWithExtension();
    try {
      const id = await extensionId(context);
      const sidePanel = await context.newPage();
      await sidePanel.goto(`chrome-extension://${id}/src/sidepanel/index.html`);
      await expect(sidePanel.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });
    } finally {
      await context.close();
    }
  });

  test('opens fixture HTML in a tab for regression smoke', async () => {
    const context = await launchWithExtension();
    try {
      const page = await context.newPage();
      const fixture = fs.readFileSync(path.join(fixturesDir, 'skip-link-missing.html'), 'utf8');
      await page.setContent(fixture);
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('a[href="#content"]')).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
});
