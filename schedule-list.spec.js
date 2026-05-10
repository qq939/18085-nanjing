const { test, expect } = require('@playwright/test');

const TARGET_URL = 'http://127.0.0.1:8082/';

test.describe('第二栏日程列表', () => {
  test('页面加载后应显示至少一条日程，并可点击编辑按钮回填表单', async ({ page }) => {
    test.setTimeout(20000);

    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });

    const scheduleItems = page.locator('.schedule-item');
    await expect(scheduleItems.first()).toBeVisible({ timeout: 10000 });
    await expect.poll(async () => scheduleItems.count(), { timeout: 10000 }).toBeGreaterThan(0);

    const firstTitle = (await scheduleItems.first().locator('.schedule-title').textContent())?.trim();
    expect(firstTitle).toBeTruthy();

    await scheduleItems.first().locator('button:has-text("编辑")').click({ timeout: 10000 });

    await expect(page.locator('#formTitle')).toHaveText('编辑日程');
    await expect(page.locator('#title')).toHaveValue(firstTitle || '');
    await expect(page.locator('#submitBtn')).toHaveText('保存修改');
  });
});
