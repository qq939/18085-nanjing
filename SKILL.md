# SKILL.md - Agent 技能文档

## 项目构建结构

```
Hermit-Claw 容器 (Agent Type: claude)
└── 工作空间: /home/agent/.claude/workspace/project
    ├── src/                  - React + TypeScript 前端源码
    │   ├── hooks/            - schedules/arrows 本地 API hooks
    │   └── components/       - 表单、列表、统计、弹窗组件
    ├── api_server.js         - 本地 CSV API，监听 8083
    ├── user_start.sh         - 启动脚本，监听 8082 的 Vite + 后台任务
    ├── schedules.csv         - 日程直接数据源
    ├── arrows.csv            - 箭头线条直接数据源
    ├── sync_to_supabase.py   - 每分钟 CSV 覆盖同步 Supabase
    ├── generate_sidebar.py   - 每小时根据 schedules.csv 生成 sidebar.html
    ├── sidebar.html          - 第三栏旅行规划
    ├── supabase_schema.sql   - schedules/arrows 表结构
    └── logs/                 - start/run/api/sync/sidebar 日志
```

## 当前架构

- 前端不再直连 Supabase；所有日程读写走 `/api/schedules`，落盘到项目根目录 `schedules.csv`。
- 箭头线条读写走 `/api/arrows`，落盘到项目根目录 `arrows.csv`。
- Vite 监听 `0.0.0.0:8082`，并将 `/api` 代理到 `127.0.0.1:8083`。
- `user_start.sh` 启动顺序：先从 Supabase 拉取 schedules/arrows 到 CSV，再后台启动 API、Vite、每分钟同步、每小时 sidebar 生成。
- `sync_to_supabase.py` 会自动确保 Supabase `arrows` 表存在，然后用本地 CSV 覆盖远端表。

## 已实现功能模块

### 日程管理

- 事项名称、描述、开始时间、结束时间增删改查
- 数据直接保存到 `schedules.csv`
- 总日程/今日 tab 筛选
- Toast 和删除确认弹窗

### 箭头线条

- 每个事项左右两侧都有连接点
- 点击一个连接点作为起点，再点击另一个连接点作为终点
- SVG 绘制有方向箭头，箭头方向由起点指向终点
- 箭头永久保存到 `arrows.csv`，并由定时任务同步到 Supabase `arrows` 表

### 旅行规划侧栏

- `generate_sidebar.py` 每 60 分钟检查 `schedules.csv` 是否变化
- 有变化时调用 Claude CLI 生成 `sidebar.html`
- 生成要求：小红书风格，包含交通、餐饮、景点建议，适配第三栏且高度无上限
- Claude CLI 无输出时写入备用 HTML，保证第三栏可用

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/schedules` | 读取 `schedules.csv` |
| POST | `/api/schedules` | 覆盖写入 `schedules.csv` |
| GET | `/api/arrows` | 读取 `arrows.csv` |
| POST | `/api/arrows` | 覆盖写入 `arrows.csv` |
| GET | `/api/sidebar` | 读取 `sidebar.html` |

## 启动与验证

```bash
bash user_start.sh
npm run build
npx playwright test schedule-list.spec.js
```

最近验证结果：

- `npm run build` 通过
- `bash user_start.sh && npx playwright test schedule-list.spec.js` 通过，2 个 E2E 测试全部成功
- Supabase `schedules` 覆盖同步成功，`arrows` 表自动创建并同步成功

## 数据表

### schedules

```sql
CREATE TABLE IF NOT EXISTS schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### arrows

```sql
CREATE TABLE IF NOT EXISTS arrows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    source_side TEXT NOT NULL CHECK (source_side IN ('left', 'right')),
    target_schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    target_side TEXT NOT NULL CHECK (target_side IN ('left', 'right')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 关键规范

- Web App 必须监听 8082
- 启动日志写入 `logs/start.log`
- Web 日志写入 `logs/run.log`
- API 日志写入 `logs/api.log`
- 同步日志写入 `logs/sync.log`
- sidebar 日志写入 `logs/sidebar.log`
- 每次会话后提交 Git
