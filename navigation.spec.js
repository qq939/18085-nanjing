const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('旅行攻略网站导航测试', () => {

  test.beforeEach(async ({ page }) => {
    // 使用相对目录加载本地文件
    await page.goto('file://' + path.resolve(__dirname, 'index.html'));
  });

  test('CSV按钮导航测试', async ({ page }) => {
    // 点击 CSV 按钮
    await page.click('a[href="./csv"]');

    // 验证 URL 是否包含 /csv
    await expect(page).toHaveURL(/\/csv/);

    // 验证页面标题包含 "CSV"
    await expect(page).toHaveTitle(/CSV/);

    // 验证页面有内容（不是空白页）
    const body = await page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('AI助手按钮导航测试', async ({ page }) => {
    // 点击 AI助手 按钮
    await page.click('a[href="./ai-assistant"]');

    // 验证 URL 是否包含 /ai-assistant
    await expect(page).toHaveURL(/\/ai-assistant/);

    // 验证页面标题包含 "AI"
    await expect(page).toHaveTitle(/AI/);

    // 验证页面有内容（不是空白页）
    const body = await page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('主页导航栏显示测试', async ({ page }) => {
    // 验证导航栏存在
    const navbar = await page.locator('.navbar');
    await expect(navbar).toBeVisible();

    // 验证 CSV 按钮存在
    const csvBtn = await page.locator('a[href="./csv"]');
    await expect(csvBtn).toBeVisible();

    // 验证 AI助手 按钮存在
    const aiBtn = await page.locator('a[href="./ai-assistant"]');
    await expect(aiBtn).toBeVisible();
  });

  test('从CSV页面返回主页测试', async ({ page }) => {
    // 先导航到 CSV 页面
    await page.click('a[href="./csv"]');
    await expect(page).toHaveURL(/\/csv/);

    // 点击主页链接 (./)
    await page.click('a.navbar-brand');
    await expect(page).toHaveURL(/index\.html|file:\/\//);
  });

  test('从AI助手页面返回主页测试', async ({ page }) => {
    // 先导航到 AI助手 页面
    await page.click('a[href="./ai-assistant"]');
    await expect(page).toHaveURL(/\/ai-assistant/);

    // 点击主页链接
    await page.click('a.navbar-brand');
    await expect(page).toHaveURL(/index\.html|file:\/\//);
  });

});

test.describe('CSV页面内容测试', () => {

  test('CSV页面数据表格测试', async ({ page }) => {
    // 导航到 CSV 页面
    await page.goto('file://' + path.resolve(__dirname, 'csv.html'));

    // 验证有表格存在
    const tables = await page.locator('.csv-table');
    await expect(tables.first()).toBeVisible();

    // 验证有交通信息
    const transportSection = await page.locator('text=交通信息');
    await expect(transportSection).toBeVisible();

    // 验证有景点信息
    const attractionsSection = await page.locator('text=大同景点');
    await expect(attractionsSection).toBeVisible();
  });

});

test.describe('AI助手页面内容测试', () => {

  test('AI助手聊天界面测试', async ({ page }) => {
    // 导航到 AI助手 页面
    await page.goto('file://' + path.resolve(__dirname, 'ai-assistant.html'));

    // 验证聊天容器存在
    const chatContainer = await page.locator('.chat-container');
    await expect(chatContainer).toBeVisible();

    // 验证有输入框
    const chatInput = await page.locator('#chatInput');
    await expect(chatInput).toBeVisible();

    // 验证有发送按钮
    const sendBtn = await page.locator('#sendBtn');
    await expect(sendBtn).toBeVisible();
  });

  test('AI助手快捷问题测试', async ({ page }) => {
    // 导航到 AI助手 页面
    await page.goto('file://' + path.resolve(__dirname, 'ai-assistant.html'));

    // 验证有快捷问题按钮
    const quickBtns = await page.locator('.quick-btn');
    await expect(quickBtns.first()).toBeVisible();

    // 点击一个快捷问题
    await quickBtns.first().click();

    // 验证消息被发送（用户消息应该出现在聊天中）
    const userMessage = await page.locator('.message-user');
    await expect(userMessage).toBeVisible();
  });

});