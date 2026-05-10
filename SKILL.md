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
    │   ├── user_start.sh   - 启动脚本
    │   └── logs/           - 日志目录
    ├── Web Apps
    │   ├── index.html      - 旅行攻略主页 (1323行)
    │   ├── ai-assistant.html - AI对话助手 (581行)
    │   ├── csv.html        - CSV工具 (682行)
    │   └── schedule.html   - 日程管理 (841行)
    └── 项目文档
        ├── README.md       - 项目说明
        └── SKILL.md        - 本文档
```

## 日志文件 logs/agent_tui.log 主要内容

### 最新会话记录

```
[2026-05-10 19:15:50] 初始化会话开始
[2026-05-10 19:15:50] 检查 Web App 8082 项目
[2026-05-10 19:15:50] 检查项目目录结构
[2026-05-10 19:15:50] 读取 systemreadme.md 了解系统规范
[2026-05-10 19:15:50] 创建 user_start.sh 启动脚本

[2026-05-10 19:17:37] 开发大同-太原-南京旅行攻略 HTML5 页面
[2026-05-10 19:17:48] 部署在8082端口上

[2026-05-10 19:41:20] 使用 Playwright 测试导航功能
[2026-05-10 19:41:20] 测试 http://dimond.top:18083/ 和 /csv 路径
[2026-05-10 19:41:20] 修复 CSV 页面无内容问题

[2026-05-10 20:02:39] 开发日程管理页面
[2026-05-10 20:02:39] 连接 Supabase 数据库
[2026-05-10 20:02:39] 实现时间冲突检测功能
```

### 关键操作记录

1. **初始化项目环境**
   - 检查启动脚本是否存在
   - 读取 systemreadme.md 了解容器配置
   - 创建启动脚本 user_start.sh

2. **开发旅行攻略页面**
   - 使用 frontend-design skill 创建小红书风格页面
   - 包含交通、景点、酒店、行程等信息
   - 部署到 8082 端口

3. **Playwright 测试**
   - 编写 navigation.spec.js 测试导航跳转
   - 测试相对路径: / 和 /csv

4. **日程管理应用**
   - 连接 Supabase 数据库
   - 实现项目名称、开始时间、结束时间管理
   - 自动检测时间冲突

## 最后3轮对话总结

### 第1轮: 初始化项目环境
- **任务**: 建立 Web App 8082 工作空间
- **操作**: 检查项目目录，创建启动脚本，创建 README.md 和 SKILL.md
- **结果**: 完成基础环境搭建

### 第2轮: 开发旅行攻略 + 测试
- **任务**: 开发大同-太原-南京旅行攻略 HTML5 页面
- **操作**: 使用 frontend-design skill 创建小红书风格旅行攻略页面
- **新增功能**:
  - 旅行攻略主页 (index.html)
  - AI 对话助手 (ai-assistant.html)
  - CSV 工具 (csv.html)
- **测试**: 使用 Playwright 进行端到端测试

### 第3轮: 日程管理应用开发
- **任务**: 开发日程管理网页
- **操作**:
  - 连接 Supabase 数据库
  - 创建 schedule.html 日程管理页面
  - 实现时间冲突检测功能
- **产出**:
  - schedule.html (841行)
  - 日程管理功能：项目名称、起点时间、终点时间
  - 列表排列，自动按时间排序
  - 时间冲突检测和警告

## 技术栈总结

### 当前 Web App 技术栈

| 技术 | 应用 |
|------|------|
| HTML5 + CSS3 | 所有页面 |
| Vanilla JavaScript | 所有页面交互 |
| Node.js | server.js 静态文件服务器 |
| Playwright | E2E 测试 |
| Supabase | 数据库支持 |

### 前端样式
- **字体**: ZCOOL KuaiLe (标题) + Noto Sans SC (正文)
- **颜色**: 珊瑚粉 #FF6B6B + 蜜桃色 #FFB88C + 橙色 #FF9F43
- **特效**: 滚动动画 (IntersectionObserver)、卡片悬停效果、渐变色主题
- **响应式**: 支持移动端和桌面端自适应布局

### Supabase 集成
```javascript
// 连接池
postgresql://postgres.uacwkmdyekxyqtopdele:Black_supabase00@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres

// 安装依赖
npm install @supabase/supabase-js @supabase/ssr
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

### 4. 开发要求
- 作为严格的产品经理角色
- 功能必须完整实现，不允许 TODO
- 必须端到端测试通过才能交付

## 已实现功能模块

### 1. 旅行攻略主页 (index.html)
- Hero 封面 - 路线概览，动态入场动画
- 统计卡片 - 行程天数、城市数、景点数、预算
- 交通指南 - 大同↔太原↔南京的高铁信息
- 城市攻略 - 大同(云冈石窟)、太原(晋祠)、南京(夫子庙)
- 酒店推荐 - 三座城市住宿建议
- 每日行程 - 5天4晚详细安排
- 总结卡片 - 旅程收获展示

### 2. AI 对话助手 (ai-assistant.html)
- AI 对话助手界面

### 3. CSV 工具 (csv.html)
- CSV 数据处理工具

### 4. 日程管理 (schedule.html)
- 项目名称、起点时间、终点时间管理
- 列表排列，按时间自动排序
- 自动检测时间冲突，冲突高亮显示
- 添加/编辑/删除日程
- Supabase 数据库支持
- 本地存储后备

## 测试配置

### Playwright 配置 (playwright.config.js)
- 测试 URL: http://dimond.top:18083/
- 测试文件: navigation.spec.js
- 验证导航按钮跳转功能

## 主人联系方式

- **邮箱**: 1119623207@qq.com
- **每次会话后需发送邮件展示执行成果**