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

## 项目结构

```
project/
├── server.js              # Node.js 静态文件服务器 (端口8082)
├── user_start.sh         # 启动脚本（容器启动时自动执行）
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

## 启动脚本

`user_start.sh` 会在容器启动时自动执行，启动 Node.js 静态文件服务器：

```bash
#!/bin/bash
cd /home/agent/.claude/workspace/project
node server.js >> logs/start.log 2>&1 &
```

## 测试

使用 Playwright 进行端到端测试：

```bash
npm install
npx playwright test
```

测试文件 `navigation.spec.js` 验证导航按钮跳转功能。

## 开发规范

1. **端口规范**: Web App 必须监听 **8082** 端口
2. **日志规范**: 所有日志输出到 `logs/` 目录
3. **Git 管理**: 每次会话后必须 `git commit`
4. **测试要求**: 功能必须端到端测试通过才能交付

## 核心职责

1. 开发、测试、发现 bug 并变更
2. 维护 Web App 8082 的正常运行
3. 确保每次部署的功能完整性
4. 严格遵循主人的需求，不变通

## 主人联系方式

- **邮箱**: 1119623207@qq.com
- **每次会话后需发送邮件展示执行成果**