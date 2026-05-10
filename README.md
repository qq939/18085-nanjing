# Web App 8082 - 项目说明

## 项目概述

本项目是 Hermit-Claw 容器内的 Web Application 工作空间，负责在 8082 端口运行多个 Web 服务。

## 项目信息

| 项目属性 | 值 |
|---------|-----|
| 项目类型 | Web App (8082端口) |
| 工作目录 | `/home/agent/.claude/workspace/project` |
| 启动脚本 | `user_start.sh` |
| 日志目录 | `logs/` |
| 端口映射 | 容器内 8082 → 宿主机 18081-19999 |

## 快速启动

```bash
# 方式1: 使用启动脚本（推荐）
bash /home/agent/.claude/workspace/project/user_start.sh

# 方式2: 手动启动
cd /home/agent/.claude/workspace/project
node server.js

# 方式3: 停止服务
pkill -f "node server.js"
```

## 项目结构

```
/home/agent/.claude/workspace/project/
├── server.js              # Node.js 静态文件服务器 (端口8082)
├── user_start.sh          # 启动脚本（容器启动时自动执行）
│
├── HTML 页面
│   └── index.html         # 日程管理主页
│
├── 数据库配置
│   └── supabase_schema.sql # Supabase 数据库表结构
│
├── 测试文件
│   ├── navigation.spec.js    # Playwright 导航测试
│   └── playwright.config.js   # Playwright 配置
│
├── 配置文件
│   ├── config.example.json   # 配置示例
│   └── node_modules/          # npm 依赖
│
├── 文档
│   ├── README.md          # 项目说明
│   ├── SKILL.md          # Agent 技能文档
│   ├── systemreadme.md   # 系统惯例文档
│   ├── AGENTS.md         # Agent 工作规范
│   ├── SOUL.md           # Agent 核心价值观
│   └── IDENTITY.md       # Agent 身份定义
│
└── logs/
    ├── start.log         # 启动日志
    ├── run.log           # 运行日志
    └── agent_tui.log     # Claude TUI 会话日志
```

## Web App 功能模块

### 日程管理 (index.html) - 三栏布局

**布局结构**:
- 第一栏(350px): 添加/编辑日程表单
- 第二栏(1fr): 日程列表（按开始时间排序）
- 第三栏(380px): 旅行规划（嵌套 sidebar.html）

**功能**:
- 事项名称、描述管理
- 开始时间、结束时间（datetime-local 选择器，两行布局）
- 增删改查日程
- **时间段冲突检测** - 实时检查并阻止冲突日程
- Supabase PostgreSQL 直连
- **每30分钟自动生成旅行规划** - 调用 Claude CLI 生成小红书风格攻略

**技术栈**:
- HTML5 + CSS3 + Vanilla JavaScript
- Node.js (pg) 直连 PostgreSQL
- Claude CLI 调用生成旅行规划
- 字体: Noto Sans SC
- 颜色: 珊瑚粉 #FF6B6B + 蜜桃色 #FFB88C + 橙色 #FF9F43

**API 端点**:
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/schedules | 获取所有日程 |
| POST | /api/schedules | 创建日程（含冲突检测） |
| PUT | /api/schedules/:id | 更新日程 |
| DELETE | /api/schedules/:id | 删除日程 |
| POST | /api/travel/generate | 生成旅行规划 |

**数据库配置 (Supabase 直连)**:
```javascript
// 连接池（推荐）
postgresql://postgres.uacwkmdyekxyqtopdele:Black_supabase00@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

**数据库表结构 (schedules)**:
```sql
- id (UUID主键)
- title (事项名称，必填，最多200字符)
- description (描述)
- start_time (开始时间，TIMESTAMPTZ)
- end_time (结束时间，TIMESTAMPTZ)
- created_at / updated_at (时间戳)
- CHECK约束确保结束时间 > 开始时间
```

### 旅行规划 (sidebar.html)

**功能**:
- 根据数据库日程自动生成小红书风格旅行攻略
- 包含交通建议、餐饮推荐、住宿建议、景点攻略
- 每30分钟自动刷新（如有日程变化）
- 格式适配第三栏宽度（380px）

**生成逻辑**:
- 前端每30分钟调用 `/api/travel/generate`
- API 将日程数据写入 `travel_input.json`
- 调用 Claude CLI 生成 `sidebar.html`
- 第三栏 iframe 嵌套显示

## 启动脚本特性

`user_start.sh` 提供以下功能：

1. **自动清理旧进程** - 启动前清理残留的 node server.js 进程
2. **日志管理** - 清空旧日志，避免重复记录
3. **启动验证** - 启动后自动验证服务是否正常（HTTP 200）
4. **详细日志** - 记录 PID、监听地址等信息

**日志输出示例**:
```
========================================
[Sun May 10 12:19:42 UTC 2026] 启动 Web App 8082
========================================
[Sun May 10 12:19:42 UTC 2026] 检查并清理旧进程...
[Sun May 10 12:19:43 UTC 2026] 启动 Node.js 静态文件服务器 (端口8082)
[Sun May 10 12:19:45 UTC 2026] ✓ Web 服务器启动成功 (PID: 764)
[Sun May 10 12:19:45 UTC 2026] 服务地址: http://localhost:8082/
[Sun May 10 12:19:45 UTC 2026] 启动脚本执行完成
```

## 测试

使用 Playwright 进行端到端测试：

```bash
# 安装依赖
npm install

# 运行测试
npx playwright test
```

## 访问地址

| 服务 | 容器内地址 | 宿主机地址 |
|------|-----------|-----------|
| 日程管理 | http://localhost:8082/ | http://dimond.top:18083/ |

## 开发规范

1. **端口规范**: Web App 必须监听 **8082** 端口
2. **日志规范**: 所有日志输出到 `logs/` 目录
3. **Git 管理**: 每次会话后必须 `git commit`
4. **测试要求**: 功能必须端到端测试通过才能交付
5. **Supabase 配置**: 连接信息写入代码，不在前端配置

## Git 提交历史

```
f8a9c3d - 更新三栏布局和旅行规划功能
e856601 - 修复启动脚本并完善项目文档
a67cb16 - 完善项目文档并添加多个Web App页面
6327a64 - 添加大同-太原-南京旅行攻略 HTML5 页面
3be38d6 - 初始化 Web App 8082 项目环境
```

## 最后3轮对话总结

| 轮次 | 时间 | 用户要求 | 产出 |
|------|------|----------|------|
| 第1轮 | 23:02:58 | 三栏布局，第三栏用Claude生成旅行规划sidebar.html | index.html (三栏) + sidebar.html + server.js API |
| 第2轮 | 23:12:17 | 数据库有数据但第二栏空着；时间放两行 | 修复布局，时间输入改为两行 |
| 第3轮 | 23:39:28 | 完整开发流程检查 | 整理日志、更新README/SKILL |

## 主人联系方式

- **邮箱**: 1119623207@qq.com
- **每次会话后需发送邮件展示执行成果**
