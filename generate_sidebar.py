import os
import time
import subprocess
import pandas as pd

PROJECT_DIR = os.path.dirname(__file__)
CSV_PATH = os.path.join(PROJECT_DIR, 'schedules.csv')
OUTPUT_HTML = os.path.join(PROJECT_DIR, 'sidebar.html')

def generate_sidebar():
    if not os.path.exists(CSV_PATH):
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] schedules.csv 不存在，跳过")
        return

    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] 生成 sidebar.html...")
    try:
        df = pd.read_csv(CSV_PATH)
        if df.empty:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] CSV 为空，跳过生成")
            return

        schedules_list = df[['title', 'start_time', 'end_time']].head(10).to_string(index=False)
        total = len(df)

        prompt = f'''请根据以下日程生成一个美观的 HTML 侧边栏文件 (sidebar.html)。

要求：
1. 移动端友好，浅色主题
2. 显示"总日程数: {total}"
3. 列出最近 10 条日程（标题、时间）
4. 包含"旅行规划建议"区块
5. 只输出纯 HTML 代码，不要 markdown 标记

日程数据:
{schedules_list}
'''

        result = subprocess.run(
            ['claude', '-p', prompt],
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode == 0 and result.stdout.strip():
            with open(OUTPUT_HTML, 'w', encoding='utf-8') as f:
                f.write(result.stdout.strip())
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] sidebar.html 生成成功 ({total} 条日程)")
        else:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Claude CLI 错误或无输出")

    except Exception as e:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] 生成失败: {e}")

if __name__ == "__main__":
    while True:
        generate_sidebar()
        time.sleep(3600)