import { test, expect } from '@playwright/test';

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:8082/';
const API_BASE = TARGET_URL.replace(/\/$/, '');

test.describe('第二栏日程列表 - 本地 CSV 数据源', () => {
  test('页面加载 schedules.csv，并可编辑首条日程', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });

    const scheduleItems = page.locator('.schedule-item');
    await expect(scheduleItems.first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.schedule-title').first()).not.toHaveText('');

    await scheduleItems.first().locator('button:has-text("编辑")').click({ timeout: 10000 });
    await expect(page.locator('.schedule-form h2')).toContainText('编辑日程');
  });

  test('点击两个连接点后生成有方向箭头，可点选并用小 x 删除', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    const originalResponse = await page.request.get(`${API_BASE}/api/arrows`);
    const originalArrows = await originalResponse.json();

    try {
      const scheduleItems = page.locator('.schedule-item');
      await expect(scheduleItems.nth(1)).toBeVisible({ timeout: 30000 });

      await scheduleItems.first().locator('.connector-right').click();
      await scheduleItems.nth(1).locator('.connector-left').click();

      const arrowPath = page.locator('.arrow-path').first();
      await expect(arrowPath).toBeVisible({ timeout: 10000 });

      const arrowsResponse = await page.request.get(`${API_BASE}/api/arrows`);
      expect(arrowsResponse.ok()).toBeTruthy();
      const arrows = await arrowsResponse.json();
      expect(arrows.length).toBe(originalArrows.length + 1);
      expect(arrows.at(-1).source_side).toBe('right');
      expect(arrows.at(-1).target_side).toBe('left');

      await arrowPath.click({ force: true });
      await expect(page.locator('.arrow-delete')).toBeVisible({ timeout: 10000 });
      await page.locator('.arrow-delete').click();

      const afterDeleteResponse = await page.request.get(`${API_BASE}/api/arrows`);
      const afterDeleteArrows = await afterDeleteResponse.json();
      expect(afterDeleteArrows.length).toBe(originalArrows.length);
    } finally {
      await page.request.post(`${API_BASE}/api/arrows`, { data: { arrows: originalArrows } });
    }
  });
});
