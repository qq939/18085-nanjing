# Web App 8082 - 项目说明

## 项目概述

本项目是 Hermit-Claw 容器内的 Web Application 工作空间，负责在 8082 端口运行 Web 服务。

## 项目信息

| 项目属性 | 值 |
|---------|-----|
| 项目类型 | Web App (8082端口) |
| 工作目录 | `/home/agent/.claude/workspace/project` |
| 启动脚本 | `user_start.sh` |
| 日志目录 | `logs/` |

## 项目结构

```
project/
├── index.html              # 主页面 (旅行攻略 HTML5 应用)
├── user_start.sh          # 启动脚本（自动执行）
├── logs/
│   ├── start.log         # 启动日志
│   ├── run.log           # 运行日志
│   └── agent_tui.log     # Claude TUI 会话日志
├── README.md             # 项目说明文档
├── SKILL.md              # Agent 技能文档
├── systemreadme.md       # 系统惯例文档
├── AGENTS.md             # Agent 工作规范
├── IDENTITY.md           # Agent 身份定义
├── SOUL.md               # Agent 核心价值观
├── BOOTSTRAP.md          # 初始化引导
├── USER.md               # 用户信息
├── HEARTBEAT.md          # 心跳检查配置
└── TOOLS.md              # 工具配置
```

## 系统配置

### 容器环境
- **端口映射**: 容器内 8082 → 宿主机 18081-19999
- **用户身份**: agent (uid=501, gid=20)
- **工作目录**: `/home/agent/.claude/workspace/project`

### 环境变量
- `CLAUDE_CODE_TRUST_ALL=true`
- `CLAUDE_CODE_SKIP_ONBOARDING=true`
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1`

## 启动脚本

`user_start.sh` 会在容器启动时自动执行，支持以下入口文件：
- `app.py` - Python Flask/FastAPI
- `server.js` - Node.js
- `main.py` - Python 应用

## 日志规范

| 日志文件 | 说明 |
|---------|-----|
| `logs/start.log` | 启动脚本输出 |
| `logs/run.log` | Web App 运行日志 |
| `logs/agent_tui.log` | Claude TUI 会话日志 |

## Supabase 配置

数据库连接池：
```
postgresql://postgres.uacwkmdyekxyqtopdele:Black_supabase00@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

## 开发规范

1. 每次会话后必须 `git commit`
2. 保持 README.md 和 SKILL.md 最新
3. Web App 必须监听 8082 端口
4. 日志输出到 `logs/` 目录

## 核心功能

### 当前应用：旅行攻略 Web App
- **功能**: 大同-太原-南京旅行攻略页面
- **风格**: 小红书笔记风格，响应式设计
- **特效**: 滚动动画、卡片悬停效果、渐变色主题

### 技术实现
- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **字体**: ZCOOL KuaiLe (标题) + Noto Sans SC (正文)
- **主题色**: 珊瑚粉 (#FF6B6B) + 蜜桃色 (#FFB88C) + 橙色 (#FF9F43)
- **响应式**: 支持移动端和桌面端

### 内容模块
1. **Hero 封面** - 路线概览，动态入场动画
2. **交通指南** - 大同→太原→南京的高铁信息
3. **城市攻略** - 大同(云冈石窟)、太原(晋祠)、南京(夫子庙)
4. **酒店推荐** - 三座城市住宿建议
5. **每日行程** - 5天4晚详细安排
6. **费用预算** - 总费用参考

## 核心职责

作为 Agent，本项目的核心任务是：
1. 开发、测试、发现 bug 并变更
2. 维护 Web App 8082 的正常运行
3. 确保每次部署的功能完整性
4. 严格遵循主人的需求，不变通
