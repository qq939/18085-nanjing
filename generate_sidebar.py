import hashlib
import csv
import os
import subprocess
import sys
import time

# PROJECT_DIR is used to resolve schedules.csv, sidebar.html, and the hash state file.
PROJECT_DIR = os.path.dirname(__file__)

# CSV_PATH is used by file_hash() and generate_sidebar() as the source of travel data.
CSV_PATH = os.path.join(PROJECT_DIR, "schedules.csv")

# README_CANDIDATES are passed to Claude so sidebar.html follows the documented generation rules.
README_CANDIDATES = [
    os.path.join(PROJECT_DIR, "README.txt"),
    os.path.join(PROJECT_DIR, "README.md"),
    os.path.join(PROJECT_DIR, "Readme.md"),
]

# OUTPUT_HTML is used by generate_sidebar() as the third-column iframe document.
OUTPUT_HTML = os.path.join(PROJECT_DIR, "sidebar.html")

# HASH_PATH is used by loop_forever() to refresh when schedules.csv or README rules change.
HASH_PATH = os.path.join(PROJECT_DIR, ".sidebar-schedules.sha256")


def timestamp():
    return time.strftime("%Y-%m-%d %H:%M:%S")


def file_hash(path):
    if not os.path.exists(path):
        return ""
    with open(path, "rb") as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def read_generation_rules():
    for readme_path in README_CANDIDATES:
        if os.path.exists(readme_path):
            with open(readme_path, "r", encoding="utf-8") as handle:
                return os.path.basename(readme_path), handle.read()
    return "README", "未找到 README 生成准则，请按 schedules.csv 生成 sidebar.html。"


def generation_hash():
    digest = hashlib.sha256()
    for path in [CSV_PATH, *README_CANDIDATES]:
        if os.path.exists(path):
            digest.update(path.encode("utf-8"))
            with open(path, "rb") as handle:
                digest.update(handle.read())
    return digest.hexdigest()


def fallback_html(total, schedules_text):
    return f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>旅行规划</title>
  <style>
    body {{ margin: 0; padding: 18px; font-family: -apple-system, BlinkMacSystemFont, "Noto Sans SC", sans-serif; background: #fff7f0; color: #2d3436; }}
    .note {{ background: #fff; border: 1px solid #ffd6c2; border-radius: 16px; padding: 16px; box-shadow: 0 8px 24px rgba(255, 107, 107, .12); }}
    h1 {{ font-size: 22px; margin: 0 0 10px; color: #ff5b5b; }}
    h2 {{ font-size: 16px; margin: 18px 0 8px; }}
    pre {{ white-space: pre-wrap; font-size: 13px; line-height: 1.6; }}
    ul {{ padding-left: 18px; line-height: 1.8; }}
  </style>
</head>
<body>
  <section class="note">
    <h1>南京行程灵感</h1>
    <p>总日程数：{total}</p>
    <h2>最近日程</h2>
    <pre>{schedules_text}</pre>
    <h2>小红书式建议</h2>
    <ul>
      <li>交通：优先把机场、高铁和酒店之间的移动时间留足 30-60 分钟缓冲。</li>
      <li>餐饮：景点前后安排轻食或咖啡，避免拍摄和步行时过饱。</li>
      <li>景点：同一区域连续游玩，少折返，多留一点随机发现的时间。</li>
    </ul>
  </section>
</body>
</html>"""


def generate_sidebar(force=False):
    if not os.path.exists(CSV_PATH):
        print(f"[{timestamp()}] schedules.csv 不存在，跳过")
        return False

    current_hash = generation_hash()
    previous_hash = ""
    if os.path.exists(HASH_PATH):
        with open(HASH_PATH, "r", encoding="utf-8") as handle:
            previous_hash = handle.read().strip()

    if not force and current_hash == previous_hash and os.path.exists(OUTPUT_HTML):
        print(f"[{timestamp()}] schedules.csv 无变化，跳过 sidebar.html 刷新")
        return True

    print(f"[{timestamp()}] 生成 sidebar.html...")
    try:
        with open(CSV_PATH, "r", encoding="utf-8", newline="") as handle:
            rows = list(csv.DictReader(handle))

        if not rows:
            print(f"[{timestamp()}] CSV 为空，跳过生成")
            return False

        total = len(rows)
        schedules_list = "\n".join(
            f"{row.get('title', '')} | {row.get('start_time', '')} - {row.get('end_time', '')}"
            for row in rows[:20]
        )
        readme_name, readme_text = read_generation_rules()

        prompt = f"""请根据以下 schedules.csv 数据自动生成完整 sidebar.html。

硬性要求：
- 只输出纯 HTML 代码，不要 markdown 标记
- 必须严格遵守 {readme_name} 中关于 sidebar.html 的生成准则
- 小红书风格：轻盈、鲜活、有分区标题，适合旅行攻略侧栏
- 必须包含天气、交通、餐饮、景点、酒店、打卡拍摄、女生着装建议
- 酒店相关内容必须联网搜索补充，信息不足时明确说明“信息不足，仅根据日程推断”
- 格式适配网页第三栏：宽度约 380px，高度无上限，内容可纵向滚动
- 显示总日程数：{total}
- 根据日程地点和时间给出具体建议，不要泛泛而谈

{readme_name} 内容：
{readme_text}

日程数据：
{schedules_list}
"""

        result = subprocess.run(
            ["claude", "-p", prompt],
            capture_output=True,
            text=True,
            timeout=120,
            check=False,
        )

        html = result.stdout.strip()
        if result.returncode != 0 or not html:
            print(f"[{timestamp()}] Claude CLI 无有效输出，写入备用 sidebar.html")
            html = fallback_html(total, schedules_list)

        with open(OUTPUT_HTML, "w", encoding="utf-8") as handle:
            handle.write(html)
        with open(HASH_PATH, "w", encoding="utf-8") as handle:
            handle.write(current_hash)

        print(f"[{timestamp()}] sidebar.html 生成成功 ({total} 条日程)")
        return True
    except Exception as error:
        print(f"[{timestamp()}] 生成失败: {error}")
        return False


def loop_forever():
    while True:
        generate_sidebar()
        time.sleep(3600)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        generate_sidebar(force=True)
    else:
        loop_forever()
