const { test, expect } = require('@playwright/test');

const TARGET_URL = 'http://localhost:8082/';

test.describe('第二栏日程列表 - Supabase 实时同步', () => {

  test('页面加载后应显示来自 Supabase 的日程，并可点击编辑按钮回填表单', async ({ page }) => {
    test.setTimeout(60000);

    // 捕获控制台日志
    const consoleLogs = [];
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else {
        consoleLogs.push(msg.text());
      }
    });

    // 捕获页面错误
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // 等待 Supabase SDK 加载
    await page.waitForFunction(() => typeof window.supabase !== 'undefined', { timeout: 15000 });
    console.log('✅ Supabase SDK 已加载');

    // 等待日程列表渲染（最多 30 秒）
    try {
      const scheduleItems = page.locator('.schedule-item');
      await expect(scheduleItems.first()).toBeVisible({ timeout: 30000 });
      const count = await scheduleItems.count();
      console.log(`✅ 日程列表已渲染，共 ${count} 条`);

      const firstTitle = (await scheduleItems.first().locator('.schedule-title').textContent())?.trim();
      console.log(`✅ 第一个日程: ${firstTitle}`);

      // 点击编辑按钮
      await scheduleItems.first().locator('button:has-text("编辑")').click({ timeout: 10000 });
      await expect(page.locator('#formTitle')).toHaveText('编辑日程');
      console.log('✅ 编辑模式已激活');
    } catch (err) {
      // 输出调试信息
      console.log('\n--- 调试信息 ---');
      console.log('页面错误:', pageErrors);
      console.log('控制台错误:', consoleErrors);
      console.log('控制台日志:', consoleLogs.slice(-10));

      // 截图
      await page.screenshot({ path: '/tmp/debug-screenshot.png', fullPage: true });
      console.log('截图已保存到 /tmp/debug-screenshot.png');

      throw err;
    }
  });

});
