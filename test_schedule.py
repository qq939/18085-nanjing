from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # 监听控制台日志
    page.on('console', lambda msg: print(f"Console {msg.type}: {msg.text}"))

    page.goto('http://localhost:8082/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # 截图
    page.screenshot(path='/tmp/schedule_app.png', full_page=True)

    # 检查页面内容
    schedule_list = page.locator('#scheduleList').inner_html()
    print(f"\n日程列表内容:\n{schedule_list[:500]}")

    # 检查是否有日程
    items = page.locator('.schedule-item').count()
    print(f"\n日程数量: {items}")

    # 检查表单
    form_visible = page.locator('#scheduleForm').is_visible()
    print(f"表单可见: {form_visible}")

    browser.close()