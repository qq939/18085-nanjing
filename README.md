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
│   ├── index.html         # 大同-太原-南京旅行攻略主页
│   ├── ai-assistant.html  # AI对话助手页面
│   ├── csv.html           # CSV工具页面
│   └── schedule.html      # 日程管理页面
│
├── 测试文件
│   ├── navigation.spec.js    # Playwright 导航测试
│   └── playwright.config.js   # Playwright 配置
│
├── 配置文件
│   ├── package.json           # npm 配置
│   └── node_modules/          # npm 依赖
│
├── 文档
│   ├── README.md          # 项目说明
│   ├── SKILL.md           # Agent 技能文档
│   ├── systemreadme.md    # 系统惯例文档
│   ├── AGENTS.md          # Agent 工作规范
│   ├── SOUL.md            # Agent 核心价值观
│   └── IDENTITY.md        # Agent 身份定义
│
└── logs/
    ├── start.log          # 启动日志
    ├── run.log            # 运行日志
    └── agent_tui.log      # Claude TUI 会话日志
```

## Web App 功能模块

### 1. 旅行攻略主页 (index.html)

**功能**: 大同-太原-南京旅行攻略页面

| 模块 | 说明 |
|------|------|
| Hero 封面 | 路线概览，动态入场动画 |
| 统计卡片 | 行程天数、城市数、景点数、预算 |
| 交通指南 | 大同↔太原↔南京的高铁信息 |
| 城市攻略 | 大同(云冈石窟)、太原(晋祠)、南京(夫子庙) |
| 酒店推荐 | 三座城市住宿建议 |
| 每日行程 | 5天4晚详细安排 |
| 费用预算 | 总费用参考 |

**技术栈**:
- HTML5 + CSS3 + Vanilla JavaScript
- 字体: ZCOOL KuaiLe + Noto Sans SC
- 颜色: 珊瑚粉 #FF6B6B + 蜜桃色 #FFB88C + 橙色 #FF9F43

### 2. AI 对话助手 (ai-assistant.html)

**功能**: AI 对话助手界面

### 3. CSV 工具 (csv.html)

**功能**: CSV 数据处理工具

### 4. 日程管理 (schedule.html)

**功能**:
- 项目名称、起点时间、终点时间管理
- 列表排列，支持添加/编辑/删除
- 自动检测时间冲突，冲突高亮显示
- Supabase 数据库支持
- 本地存储后备

**数据库配置**:
```
连接池: postgresql://postgres.uacwkmdyekxyqtopdele:Black_supabase00@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

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

测试文件 `navigation.spec.js` 验证导航按钮跳转功能。

## 访问地址

| 服务 | 容器内地址 | 宿主机地址 |
|------|-----------|-----------|
| 主站 | http://localhost:8082/ | http://dimond.top:18083/ |
| AI助手 | http://localhost:8082/ai-assistant | http://dimond.top:18083/ai-assistant |
| CSV工具 | http://localhost:8082/csv | http://dimond.top:18083/csv |
| 日程管理 | http://localhost:8082/schedule | http://dimond.top:18083/schedule |

## 开发规范

1. **端口规范**: Web App 必须监听 **8082** 端口
2. **日志规范**: 所有日志输出到 `logs/` 目录
3. **Git 管理**: 每次会话后必须 `git commit`
4. **测试要求**: 功能必须端到端测试通过才能交付

## Git 提交历史

```
a67cb16 - 完善项目文档并添加多个Web App页面
6327a64 - 添加大同-太原-南京旅行攻略 HTML5 页面
3be38d6 - 初始化 Web App 8082 项目环境
```

## 主人联系方式

- **邮箱**: 1119623207@qq.com
- **每次会话后需发送邮件展示执行成果**
