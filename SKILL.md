# SKILL.md - Agent 技能文档

## 会话总结

### 最后3轮对话内容

#### 第1轮对话
- **任务**: 初始化项目环境，建立 Web App 8082 工作空间
- **操作**: 检查项目目录，创建启动脚本，创建 README.md 和 SKILL.md
- **结果**: 完成基础环境搭建

#### 第2轮对话
- **任务**: 遵循 systemreadme.md 中的规范执行
- **操作**: 读取系统惯例文档，了解容器配置、日志规范、Git 管理要求
- **结果**: 掌握 Hermit-Claw 容器内的开发规范

#### 第3轮对话（当前）
- **任务**: 开发大同-太原-南京旅行攻略 HTML5 页面
- **操作**: 使用 frontend-design skill 创建小红书风格旅行攻略页面
- **结果**: 完成旅行攻略 Web App 开发，包含交通、景点、酒店、行程等信息
- **产出**:
  - `index.html` - 主页面 (41KB)
  - 更新 `user_start.sh` - Python HTTP 服务器提供静态文件
  - 更新 `README.md` - 添加核心功能说明
  - 更新 `SKILL.md` - 本文档

## 日志文件 logs/agent_tui.log 主要内容

```
[2026-05-10 19:15:50] - 会话开始
[2026-05-10 19:15:50] - 收到初始化指令：检查 Web App 8082 项目
[2026-05-10 19:15:50] - 检查项目目录结构
[2026-05-10 19:15:50] - 检查启动脚本 user_start.sh (不存在，需创建)
[2026-05-10 19:15:50] - 读取 systemreadme.md 了解系统规范
[2026-05-10 19:15:50] - 检查现有文档：AGENTS.md, IDENTITY.md, SOUL.md 等
[2026-05-10 19:15:50] - 创建 user_start.sh 启动脚本
[2026-05-10 19:15:50] - 创建 README.md 项目文档
[2026-05-10 19:15:50] - 创建 SKILL.md 技能文档
```

## 项目构建结构

```
Hermit-Claw 容器 (Agent Type: claude)
└── 工作空间: /home/agent/.claude/workspace/project
    ├── 核心文档
    │   ├── SOUL.md         - Agent 核心价值观和自主权限
    │   ├── IDENTITY.md     - Agent 身份定义
    │   ├── AGENTS.md       - Agent 工作规范和记忆管理
    │   └── USER.md         - 主人信息
    ├── 系统配置
    │   ├── systemreadme.md - 系统惯例和规范
    │   ├── BOOTSTRAP.md    - 初始化引导
    │   └── HEARTBEAT.md    - 心跳检查配置
    ├── 启动与运行
    │   ├── user_start.sh   - Python HTTP 服务器 (端口8082)
    │   └── logs/           - 日志目录
    ├── Web App
    │   ├── index.html      - 旅行攻略 HTML5 页面
    │   └── 端口: 8082
    └── 项目文档
        ├── README.md       - 项目说明
        └── SKILL.md        - 技能文档
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
- 可选维护 `commit.txt` 记录提交历史

### 4. 开发要求
- 作为严格的产品经理角色
- 功能必须完整实现，不允许 TODO
- 必须端到端测试通过才能交付
- 必须 git commit

## 技术栈参考

### 当前 Web App 技术栈
```html
<!-- HTML5 旅行攻略页面 -->
- 框架: 原生 HTML5 + CSS3 + Vanilla JavaScript
- 字体: ZCOOL KuaiLe (可爱风格标题) + Noto Sans SC (中文正文)
- 颜色: 珊瑚粉 #FF6B6B + 蜜桃色 #FFB88C + 橙色 #FF9F43
- 特效: 滚动动画 (IntersectionObserver)、卡片悬停效果、渐变色主题
- 响应式: 支持移动端和桌面端自适应布局
```

### Supabase 集成
```javascript
// 安装依赖
npm install @supabase/supabase-js @supabase/ssr

// 连接池
postgresql://postgres.uacwkmdyekxyqtopdele:Black_supabase00@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

### 环境变量 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ixOQZXbObcNcP-PfiIrILg_PQtGKskp
```

## 旅行攻略功能模块

### 已实现功能
1. **Hero 封面** - 路线概览，动态入场动画
2. **统计卡片** - 行程天数、城市数、景点数、预算
3. **交通指南** - 大同↔太原↔南京的高铁信息
4. **城市攻略** - 大同(云冈石窟)、太原(晋祠)、南京(夫子庙)
5. **酒店推荐** - 三座城市住宿建议
6. **每日行程** - 5天4晚详细安排
7. **总结卡片** - 旅程收获展示

### 设计特色
- 小红书风格卡片设计
- 滚动时淡入动画效果
- 卡片悬停放大效果
- 渐变色背景
- 响应式布局

## 主人联系方式

- **邮箱**: 1119623207@qq.com
- **每次会话后需发送邮件展示执行成果**
