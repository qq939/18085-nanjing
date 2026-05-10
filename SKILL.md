# SKILL.md - Agent 技能文档

## 项目构建结构

```
Hermit-Claw 容器 (Agent Type: claude)
└── 工作空间: /home/agent/.claude/workspace/project
    ├── 核心文档
    │   ├── SOUL.md         - Agent 核心价值观和自主权限
    │   ├── IDENTITY.md     - Agent 身份定义
    │   ├── AGENTS.md       - Agent 工作规范和记忆管理
    │   ├── BOOTSTRAP.md    - 初始化引导
    │   ├── HEARTBEAT.md    - 心跳检查配置
    │   └── USER.md         - 主人信息
    ├── 系统配置
    │   ├── systemreadme.md - 系统惯例和规范
    │   └── TOOLS.md        - 工具配置
    ├── 启动与运行
    │   ├── server.js       - Node.js 静态文件服务器 (端口8082)
    │   ├── user_start.sh   - 启动脚本（带进程清理和启动验证）
    │   └── logs/           - 日志目录
    ├── Web Apps
    │   └── index.html      - 日程管理主页 (868行)
    ├── 数据库配置
    │   └── supabase_schema.sql - 数据库表结构和函数
    └── 项目文档
        ├── README.md       - 项目说明
        └── SKILL.md        - 本文档
```

## 日志文件 logs/agent_tui.log 主要内容

### 最新会话记录

| 时间 | 操作 | 产出 |
|------|------|------|
| 20:27:29 | 用户要求移除 CSV 和 AI 助手 | 保留日程管理功能 |
| 20:29:27 | 开发日程管理应用 | index.html (868行) + supabase_schema.sql |
| 20:44:25 | 修改 Supabase 配置 | 配置直接写入代码，无需前端配置 |
| 20:53:25 | 初始化会话，检查项目环境 | 读取 systemreadme.md |
| 20:54:50 | 再次初始化会话 | 完成文档更新 |

### 关键操作记录

1. **移除不需要的功能**
   - 用户明确要求不要 CSV 和 AI 助手
   - 只保留日程管理功能

2. **开发日程管理应用**
   - 事项名称、描述管理
   - 开始时间、结束时间选择
   - 增删改查日程
   - 时间段冲突检测

3. **Supabase 数据库集成**
   - 连接信息: `https://uacwkmdyekxyqtopdele.supabase.co`
   - Anon Key 内置在代码中
   - 创建 schedules 表和相关函数

4. **配置文件修改**
   - 遵循 systemreadme.md 规范
   - Supabase 配置直接写入 JavaScript
   - 不在前端暴露配置

## 最后3轮对话总结

### 第1轮: 移除 CSV 和 AI 助手 (20:27:29)
- **用户要求**: 不要 csv 和 ai 助手，好好写日程管理
- **任务**: 日程管理，事项，起始时间，结束时间，可以增减项目，可以选择和直接填写时间，时间段不能冲突，落表到 supabase
- **操作**:
  - 移除 ai-assistant.html 和 csv.html
  - 重写 index.html 为日程管理应用
  - 创建 supabase_schema.sql 数据库表结构
- **产出**:
  - index.html (868行) - 日程管理前端应用
  - supabase_schema.sql - 数据库表结构

### 第2轮: 修复 Supabase 配置 (20:44:25)
- **用户要求**: 不要让我在前端配置 supabase，你自己看 systemreadme 去
- **操作**:
  - 移除前端 Supabase 配置输入框
  - 直接将连接信息写入 JavaScript 代码
  - URL: `https://uacwkmdyekxyqtopdele.supabase.co`
  - Anon Key: 内置 JWT 令牌
- **产出**: 配置已内置，应用启动时自动连接数据库

### 第3轮: 初始化会话 (20:53:25)
- **任务**: 完整开发、测试、发现 bug、变更流程
- **操作**:
  - 检查启动脚本 user_start.sh
  - 读取 logs/agent_tui.log 整理内容
  - 更新 README.md 和 SKILL.md
- **产出**: 完整项目文档

## 技术栈总结

### 当前 Web App 技术栈

| 技术 | 应用 |
|------|------|
| HTML5 + CSS3 | index.html 页面 |
| Vanilla JavaScript | 所有页面交互 |
| Node.js | server.js 静态文件服务器 |
| Playwright | E2E 测试 |
| Supabase JS SDK | 数据库连接 |
| PostgreSQL | 数据库后端 |

### 前端样式
- **字体**: Noto Sans SC
- **颜色**: 珊瑚粉 #FF6B6B + 蜜桃色 #FFB88C + 橙色 #FF9F43
- **布局**: 网格布局，日程列表按开始时间排序
- **响应式**: 支持移动端和桌面端自适应布局

### Supabase 集成

```javascript
// 内置配置
const SUPABASE_URL = 'https://uacwkmdyekxyqtopdele.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const SUPABASE_TABLE = 'schedules';

// 连接池
postgresql://postgres.uacwkmdyekxyqtopdele:Black_supabase00@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

## 数据库表结构 (schedules)

```sql
CREATE TABLE schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 200),
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- 索引
CREATE INDEX idx_schedules_start_time ON schedules(start_time);
CREATE INDEX idx_schedules_time_range ON schedules(start_time, end_time);

-- 冲突检测函数
CREATE OR REPLACE FUNCTION check_time_conflict(
    start_query TIMESTAMPTZ,
    end_query TIMESTAMPTZ,
    exclude_id UUID DEFAULT NULL
) RETURNS TABLE(...) AS $$ ... $$ LANGUAGE plpgsql;
```

## 启动脚本 user_start.sh 功能说明

### 脚本特性

```bash
#!/bin/bash
# Hermit-Claw Web App 8082 启动脚本
# 日志输出到 logs/start.log

# 1. 自动清理旧进程（使用精确匹配）
pkill -f "node /home/agent/.claude/workspace/project/server.js" 2>/dev/null || true

# 2. 日志管理
echo "========================================" > logs/start.log
echo "[$(date)] 启动 Web App 8082" >> logs/start.log

# 3. 启动验证（curl 检查 HTTP 200）
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/ 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Web 服务器启动成功"
fi
```

### 日志输出示例

```
========================================
[Sun May 10 12:33:24 UTC 2026] 启动 Web App 8082
========================================
[Sun May 10 12:33:24 UTC 2026] 检查并清理旧进程...
[Sun May 10 12:33:25 UTC 2026] 工作目录: /home/agent/.claude/workspace/project
[Sun May 10 12:33:25 UTC 2026] 启动 Node.js 静态文件服务器 (端口8082)
[Sun May 10 12:33:27 UTC 2026] ✓ Web 服务器启动成功 (PID: 3478)
[Sun May 10 12:33:27 UTC 2026] 服务地址: http://localhost:8082/
[Sun May 10 12:33:27 UTC 2026] 启动脚本执行完成
```

## 关键规范要点

### 1. 端口规范
- Web App 必须监听 **8082** 端口
- 宿主机通过 18081-19999 端口访问

### 2. 日志规范
- `logs/start.log` - 启动脚本日志
- `logs/run.log` - Web App 运行日志
- `logs/agent_tui.log` - TUI 会话日志

### 3. Git 管理
- 每次会话后必须 `git add . && git commit`
- 维护 `.gitignore` 排除日志和临时文件

### 4. Supabase 配置规范
- 连接信息写入 JavaScript 代码
- 不在前端暴露敏感信息
- 参考 systemreadme.md 中的 supabase skill 安装方法

## 已实现功能模块

### 日程管理 (index.html)

**核心功能**:
- 事项名称、描述管理
- 开始时间、结束时间（datetime-local 选择器）
- 增删改查日程
- **时间段冲突检测** - 实时检查并阻止冲突日程
- 时间自动按开始时间排序

**UI 组件**:
- 表单卡片 - 添加/编辑日程
- 列表卡片 - 日程列表展示
- 统计卡片 - 总日程/今日统计
- 删除确认弹窗
- Toast 提示

**冲突检测逻辑**:
```javascript
// 两段时间有交集的条件：
// (start1 < end2) AND (end1 > start2)
const conflicts = schedules.filter(s => {
    if (editId && s.id === editId) return false;
    const sStart = new Date(s.start_time);
    const sEnd = new Date(s.end_time);
    return start < sEnd && end > sStart;
});
```

## 测试配置

### Playwright 配置 (playwright.config.js)
- 测试 URL: http://dimond.top:18083/
- 测试文件: navigation.spec.js
- 验证导航按钮跳转功能

## 访问地址

| 服务 | 容器内地址 | 宿主机地址 |
|------|-----------|-----------|
| 日程管理 | http://localhost:8082/ | http://dimond.top:18083/ |

## 主人联系方式

- **邮箱**: 1119623207@qq.com
- **每次会话后需发送邮件展示执行成果**
