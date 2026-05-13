# Web App 8082 - 日程管理应用

## 项目概述

基于 Hermit-Claw 容器的日程管理 Web App，运行在 **8082 端口**，支持日程增删改查、事项箭头连线和 AI 旅行规划生成。

| 属性 | 值 |
|------|-----|
| 类型 | Web App (8082端口) |
| 工作目录 | `/home/agent/.claude/workspace/project` |
| 启动脚本 | `user_start.sh` |
| 日志目录 | `logs/` |
| 端口映射 | 容器内 8082 → 宿主机 18081-19999 |

---

## 快速启动

```bash
# 使用启动脚本（推荐）
bash user_start.sh

# 手动启动
bash user_start.sh

# 停止服务
pkill -f "node.*server.js"
```

---

## 项目结构

```
/home/agent/.claude/workspace/project/
├── api_server.js          # 本地 CSV API (端口8083，由 Vite 代理 /api)
├── user_start.sh          # 启动脚本（容器启动时自动执行）
├── src/                   # React + TypeScript 前端源码
├── schedules.csv          # 本地日程数据源
├── arrows.csv             # 本地箭头线条数据源
├── sidebar.html           # 旅行规划（iframe 嵌套）
├── supabase_schema.sql    # 数据库表结构
├── schedule-list.spec.js  # Playwright 日程列表测试
├── playwright.config.js    # Playwright 配置
└── logs/
    ├── start.log          # 启动日志
    └── run.log            # 运行日志
```

---

## 功能模块

### 三栏布局

| 栏位 | 宽度 | 内容 |
|------|------|------|
| 第一栏 | 350px | 添加/编辑日程表单 |
| 第二栏 | 1fr | 日程列表（支持总日程/今日切换） |
| 第三栏 | 380px，高度 >= 1200px | AI 旅行规划 iframe |

### 日程管理 (index.html)

**技术栈**: React + TypeScript + Vite

**核心功能**:
- ✅ 事项名称、描述管理
- ✅ 开始/结束时间（datetime-local 选择器）
- ✅ `schedules.csv` 本地文件作为直接数据源
- ✅ 左右连接点创建有方向箭头线条
- ✅ 箭头同时保存到 `arrows.csv` 和 Supabase `arrows` 表
- ✅ 总日程/今日 tab 切换筛选
- ✅ 增删改查 + Toast 提示

**颜色主题**: 珊瑚粉 #FF6B6B | 蜜桃色 #FFB88C | 橙色 #FF9F43

**字体**: Noto Sans SC

### 旅行规划 (sidebar.html)

- 由 Claude CLI 根据 `schedules.csv` 自动生成，输出为可直接嵌入第三栏 iframe 的 `sidebar.html`
- sidebar.html 的第一优先级是评估行程之间的交通合理性：每两个相邻日程都要判断“从 A 到 B 是否来得及、推荐交通方式是什么、需要预留多少缓冲、哪里可能迟到或折返”
- 必须逐段输出交通分析：上一站、下一站、出发/到达时间窗口、推荐方式（步行/地铁/公交/打车/高铁/飞机/酒店接驳等）、预计耗时、风险等级、调整建议
- 对不合理行程必须明确标注，例如“时间偏紧”“跨城衔接风险高”“机场/高铁站建议提前出发”“建议删除/前移/后移某个事项”，不要只写好听的攻略
- 交通方式建议必须具体到可执行：优先级、为什么选它、什么时候改打车、是否需要提前叫车、是否要预留安检/值机/取票/步行进站时间
- 如果行程包含酒店、机场、火车站、景区，必须把这些节点作为交通锚点，优先分析它们之间的移动效率和等待时间
- 酒店相关内容必须联网搜索补充到 `sidebar.html`：包括酒店位置、周边交通、到主要景点/机场/车站的移动建议、周边餐饮/便利店、入住/休息节奏建议；如果网络信息不足，必须明确写“信息不足，仅根据日程推断”
- 天气、餐饮、景点、拍摄和女生着装建议是辅助内容，必须服务于交通判断和当天体力分配，不要喧宾夺主
- 整体呈现可以像小红书图文日志：轻松、真实、适合收藏，但内容核心必须是路线诊断、交通方式和时间风险
- 图文日志可以使用分段标题、贴纸感标签、emoji、短句和卡片式段落，但不要依赖外链图片；如需要图片氛围，用文字描述“路上看到什么、在哪里停留、哪个点适合顺手拍”
- 格式必须适配第三栏：宽度约 380px，高度强制 >= 1200px，内容可纵向滚动，避免横向滚动、超宽表格和大段密集文字
- 每 60 分钟自动刷新；只有 `schedules.csv` 发生变化或联网补充信息需要更新时才重写 `sidebar.html`

**sidebar.html 内容准则**:
- 开头给出“今日交通体检”结论：整体是否顺、最紧张的一段、最建议调整的一段、是否需要打车兜底
- 必须提供“行程衔接表”，按时间顺序列出每两个相邻事项之间的交通评估
- 每段衔接至少包含：起点、终点、计划间隔、推荐交通方式、预计路上时间、建议出发时间、缓冲时间、风险等级、备注
- 风险等级建议使用“稳 / 偏紧 / 高风险 / 不建议”四档，不能所有段落都写成安全
- 必须给出“交通方式优先级”：什么时候步行、什么时候地铁、什么时候打车、什么时候必须提前出发
- 天气模块要说明天气对交通的影响，例如下雨打车更难、步行变慢、景区排队/拍摄节奏变化
- 酒店模块必须通过网络搜索补全真实信息；不要凭空编造酒店设施、价格、评分或营业时间；重点写酒店到机场/车站/景区的交通便利性
- 餐饮和打卡拍摄模块只能作为路线空档的补充，必须标注适合插入在哪个交通空档，不要打乱主行程
- 女生着装模块要结合天气、步行强度、交通方式和拍摄地点，给出鞋子、外套、包、补妆/防晒等建议
- 结尾给出“需要改动的日程建议”：列出建议提前、延后、删除、合并或改交通方式的事项

**生成逻辑**:
1. `user_start.sh` 后台启动 `generate_sidebar.py`
2. 定时任务每小时检查 `schedules.csv` 是否变化
3. 如有变化，调用 Claude CLI 生成 `sidebar.html`
4. 第三栏 iframe 通过 `/api/sidebar` 显示最新内容

---

## 架构设计原则

### 1. CSV 优先的数据架构

- **本地直接数据源**: 前端只读写本地 API，API 持久化到 `schedules.csv` / `arrows.csv`
- **Supabase 后台同步**: 启动时先拉取远端数据到 CSV，之后每分钟用 CSV 覆盖同步远端表
- **双表一致模式**: `arrows` 的存储、拉取、覆盖同步与 `schedules` 完全一致

### 2. Vite + API 分层

- Vite 在 8082 提供 React + TypeScript 前端
- `api_server.js` 在 8083 提供 CSV API，Vite 将 `/api` 代理到 8083
- `user_start.sh` 使用 `nohup` 后台启动 API、Vite、同步任务和 sidebar 生成任务

### 3. 移动端优先

- 三栏布局在移动端自动切换为单栏
- 统计数字改为 tab 切换，节省空间
- 最小高度 400px，确保内容可见

---

## 开发规范

### Git 管理

每次对话后必须提交：

```bash
git add .
git commit -m "描述本次变更"
git push origin master
```

### 测试要求

- 使用 Playwright 进行端到端测试
- 功能必须测试通过才能交付
- 测试文件: `schedule-list.spec.js`

```bash
npx playwright test schedule-list.spec.js
```

### 日志规范

- Web App 运行日志: `logs/run.log`
- 启动脚本日志: `logs/start.log`
- 禁止删除 `logs/` 目录（bind mount）

---

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 主页 index.html |
| GET | `/api/schedules` | 读取 schedules.csv |
| POST | `/api/schedules` | 覆盖写入 schedules.csv |
| GET | `/api/arrows` | 读取 arrows.csv |
| POST | `/api/arrows` | 覆盖写入 arrows.csv |
| GET | `/api/sidebar` | 读取 sidebar.html |

---

## 数据结构

### 日程对象 (schedules.csv)

```javascript
{
  id: string,           // UUID
  title: string,         // 事项名称
  description: string,  // 描述（可选）
  start_time: string,   // ISO 8601 时间
  end_time: string       // ISO 8601 时间
}
```

### 箭头对象 (arrows.csv)

```javascript
{
  id: string,
  source_schedule_id: string,
  source_side: 'left' | 'right',
  target_schedule_id: string,
  target_side: 'left' | 'right',
  created_at: string,
  updated_at: string
}
```

---

## 默认种子数据

首次使用时预置太原行程：

1. 大同南 → 太原 G3769（高铁）
2. 星巴克太原华域购物中心（早餐）
3. 太原站 → 城市之光民宿（交通）
4. 乐刻健身太原王府井（晨练）
5. 测试项目（验证列表渲染）

---

## 容器环境

- **端口**: 8082
- **日志**: `logs/start.log`, `logs/run.log`
- **工作目录**: `/home/agent/.claude/workspace/project`
- **启动脚本**: `user_start.sh`

---

## Git 提交历史

| Commit | 描述 |
|--------|------|
| 4eb0fd9 | 移动端优化-统计栏改为同行tab切换 |
| 750c99e | 第二栏改用localStorage，彻底去掉Supabase |
| d3e1d87 | 初始版本（Supabase 架构） |

---

## 主人联系方式

- **邮箱**: 1119623207@qq.com
- **每次会话后需发送邮件展示执行成果**
